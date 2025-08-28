import React, { useCallback, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { EmbedImage } from "@/types/embed";
import { useResponsiveWidth } from "@/hooks/useResponsiveWidth";
import { router, useFocusEffect } from "expo-router";
import Transition from "react-native-screen-transitions";
import { useLightBoxOpen } from "@/store/lightBox";
import { Image } from "@/components/ui";
import { isNative } from "@/platform";
interface ImageEmbedProps {
  images: EmbedImage[];
  isDetailView?: boolean;
  onImagePress?: (images: EmbedImage[], index: number) => void;
}

function ImageShareTransition({
  image,
  dimensions,
  onPress,
}: {
  onPress: () => void;
  image: EmbedImage;
  dimensions: { width: number; height: number };
}) {
  const [isViewing, setIsViewing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsViewing(false);
    }, [])
  );

  if (isNative) {
    const sharedBoundTag = `post-${image.fullsize}`;
    return (
      <Transition.Pressable
        onPress={() => {
          setTimeout(() => {
            setIsViewing(true);
          }, 300);
          onPress();
        }}
        style={{
          alignSelf: "stretch",
          aspectRatio: dimensions.width / dimensions.height,
        }}
        sharedBoundTag={sharedBoundTag}
      >
        {isViewing ? (
          <View style={[styles.singleImage, dimensions]} />
        ) : (
          <Image
            source={{ uri: image.fullsize }}
            style={[styles.singleImage, dimensions]}
            contentFit="cover"
          />
        )}
      </Transition.Pressable>
    );
  }

  return (
    <Image
      source={{ uri: image.fullsize }}
      style={[styles.singleImage, dimensions]}
      contentFit="cover"
    />
  );
}

export function ImageEmbed({ images, isDetailView = false }: ImageEmbedProps) {
  const maxImageWidth = useResponsiveWidth();
  const { setValue } = useLightBoxOpen();
  // Helpers to compute aspect ratios and clamp to sane bounds similar to Bluesky/X
  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));
  const MIN_AR = 0.5; // 1:2
  const MAX_AR = 1.8; // ~16:9

  type WithOptionalDims = EmbedImage & {
    dimensions?: { width?: number; height?: number };
    dimension?: { width?: number; height?: number };
  };
  const getAspectRatio = useCallback((img: EmbedImage) => {
    // Prefer explicit aspectRatio, then dimension(s), else fallback 1
    const i = img as WithOptionalDims;
    const ar = i?.aspectRatio
      ? (i.aspectRatio.width || 1) / (i.aspectRatio.height || 1)
      : i?.dimensions
      ? (i.dimensions.width ?? 1) / (i.dimensions.height ?? 1)
      : i?.dimension
      ? (i.dimension.width ?? 1) / (i.dimension.height ?? 1)
      : 1;
    return clamp(ar, MIN_AR, MAX_AR);
  }, []);

  const GAP = 4;

  const twoUpHeight = useMemo(() => {
    if (!images?.length) return isDetailView ? 260 : 220;
    const eachWidth = (maxImageWidth - GAP) / 2;
    const ars = images.slice(0, 2).map(getAspectRatio);
    const median = ars.sort((a, b) => a - b)[Math.floor(ars.length / 2)] || 1;
    const rawH = Math.round(eachWidth / median);
    return clamp(rawH, isDetailView ? 220 : 180, isDetailView ? 320 : 260);
  }, [images, getAspectRatio, isDetailView, maxImageWidth]);

  const threeUpHeights = useMemo(() => {
    const leftWidth = Math.floor((maxImageWidth - GAP) * 0.6);
    const rightWidth = maxImageWidth - GAP - leftWidth;
    const leftAR = images[0] ? getAspectRatio(images[0]) : 1;
    const rightARs = images.slice(1, 3).map(getAspectRatio);
    const rightMedian = rightARs.length
      ? rightARs.sort((a, b) => a - b)[Math.floor(rightARs.length / 2)]
      : 1;
    // Choose total height so left fits and right stack (each half) also looks good
    const leftH = leftWidth / leftAR;
    const rightH = (rightWidth / rightMedian) * 2; // two stacked
    const target = Math.round(
      clamp(
        Math.min(leftH, rightH),
        isDetailView ? 240 : 200,
        isDetailView ? 360 : 280
      )
    );
    return { leftWidth, rightWidth, totalHeight: target };
  }, [images, getAspectRatio, isDetailView, maxImageWidth]);

  const fourUpHeight = useMemo(() => {
    const eachWidth = (maxImageWidth - GAP) / 2;
    // keep squares for a clean grid
    const rawH = Math.round(eachWidth);
    return clamp(rawH, isDetailView ? 180 : 150, isDetailView ? 260 : 220);
  }, [isDetailView, maxImageWidth]);

  const calculateImageDimensions = useCallback(
    (image: EmbedImage, index: number, total: number) => {
      const aspectRatio = getAspectRatio(image);
      let width = maxImageWidth;
      let height = Math.round(width / aspectRatio);

      if (total === 1) {
        const minH = isDetailView ? 220 : 180;
        const maxH = isDetailView ? 540 : 420;
        height = clamp(height, minH, maxH);
      } else if (total === 2) {
        width = (maxImageWidth - GAP) / 2;
        height = twoUpHeight;
      } else if (total === 3) {
        const { leftWidth, rightWidth, totalHeight } = threeUpHeights;
        if (index === 0) {
          width = leftWidth;
          height = totalHeight;
        } else {
          width = rightWidth;
          height = Math.floor((totalHeight - GAP) / 2);
        }
      } else {
        width = (maxImageWidth - GAP) / 2;
        height = fourUpHeight;
      }

      return { width, height };
    },
    [
      getAspectRatio,
      maxImageWidth,
      isDetailView,
      twoUpHeight,
      threeUpHeights,
      fourUpHeight,
    ]
  );

  const handleImagePress = useCallback(
    (index: number) => {
      // Ensure destination has data before navigating to avoid transient empty shared tags
      setValue(images, index, `post-${images[index].fullsize}`);
      setTimeout(() => {
        router.push({
          pathname: "/viewer/image-post",
        });
      }, 50); // slight delay to ensure state is set before navigation
    },
    [images, setValue]
  );

  if (!images || images.length === 0) {
    return null;
  }
  const renderImageGrid = () => {
    const totalImages = Math.min(images.length, 4);
    const displayImages = images.slice(0, totalImages);

    if (totalImages === 1) {
      const dimensions = calculateImageDimensions(images[0], 0, 1);
      return (
        <ImageShareTransition
          onPress={() => handleImagePress(0)}
          image={images[0]}
          dimensions={dimensions}
        />
      );
    }

    if (totalImages === 2) {
      return (
        <View style={styles.twoImageContainer}>
          <ImageShareTransition
            onPress={() => handleImagePress(0)}
            image={displayImages[0]}
            dimensions={calculateImageDimensions(displayImages[0], 0, 2)}
          />
          <View style={{ width: 4 }} />
          <ImageShareTransition
            onPress={() => handleImagePress(1)}
            image={displayImages[1]}
            dimensions={calculateImageDimensions(displayImages[1], 1, 2)}
          />
        </View>
      );
    }

    if (totalImages === 3) {
      return (
        <View style={styles.threeImageRow}>
          {/* Left tall image */}
          <ImageShareTransition
            onPress={() => handleImagePress(0)}
            image={images[0]}
            dimensions={calculateImageDimensions(images[0], 0, 3)}
          />
          <View style={{ width: 4 }} />
          {/* Right column with two stacked images */}
          <View style={styles.rightColumn}>
            <ImageShareTransition
              onPress={() => handleImagePress(1)}
              image={images[1]}
              dimensions={calculateImageDimensions(images[1], 1, 3)}
            />
            <View style={{ height: 4 }} />
            <ImageShareTransition
              onPress={() => handleImagePress(2)}
              image={images[2]}
              dimensions={calculateImageDimensions(images[2], 2, 3)}
            />
          </View>
        </View>
      );
    }

    // Four images - 2x2 grid
    if (displayImages.length === 4) {
      return (
        <View style={styles.gridContainer}>
          <View style={{ flexDirection: "row", marginBottom: 4 }}>
            <ImageShareTransition
              onPress={() => handleImagePress(0)}
              image={displayImages[0]}
              dimensions={calculateImageDimensions(displayImages[0], 0, 4)}
            />
            <View style={{ width: 4 }} />
            <ImageShareTransition
              onPress={() => handleImagePress(1)}
              image={displayImages[1]}
              dimensions={calculateImageDimensions(displayImages[1], 1, 4)}
            />
          </View>
          <View style={{ flexDirection: "row" }}>
            <ImageShareTransition
              onPress={() => handleImagePress(2)}
              image={displayImages[2]}
              dimensions={calculateImageDimensions(displayImages[2], 2, 4)}
            />
            <View style={{ width: 4 }} />
            <ImageShareTransition
              onPress={() => handleImagePress(3)}
              image={displayImages[3]}
              dimensions={calculateImageDimensions(displayImages[3], 3, 4)}
            />
          </View>
        </View>
      );
    }
    // Fallback (shouldn't happen since we cap at 4)
    return null;
  };

  return <View style={styles.container}>{renderImageGrid()}</View>;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  singleImage: {
    backgroundColor: "#e5e7eb",
  },
  twoImageContainer: {
    flexDirection: "row",
  },
  threeImageRow: {
    flexDirection: "row",
  },
  rightColumn: {
    flexDirection: "column",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageWrapper: {
    flex: 1,
  },
  gridImageWrapper: {
    position: "relative",
  },
  gridImage: {
    backgroundColor: "#e5e7eb",
  },
  // Removed "+N" overlay since we cap at 4 images
});
