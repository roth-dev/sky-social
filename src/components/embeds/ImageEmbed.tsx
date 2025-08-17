import React, { useCallback } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { EmbedImage } from "@/types/embed";
import { Image } from "expo-image";
import { useResponsiveWidth } from "@/hooks/useResponsiveWidth";
import { router } from "expo-router";
import Transition from "react-native-screen-transitions";
import { useLightBoxOpen } from "@/store/lightBox";
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
  const sharedBoundTag = `post-${image.fullsize}`;
  return (
    <Transition.Pressable
      onPress={onPress}
      delayLongPress={200}
      style={{
        alignSelf: "stretch",
        aspectRatio: dimensions.width / dimensions.height,
      }}
      sharedBoundTag={sharedBoundTag}
    >
      <Image
        source={{ uri: image.fullsize }}
        style={[styles.singleImage, dimensions]}
        contentFit="cover"
      />
    </Transition.Pressable>
  );
}

export function ImageEmbed({ images, isDetailView = false }: ImageEmbedProps) {
  const maxImageWidth = useResponsiveWidth();
  const { setValue } = useLightBoxOpen();
  const calculateImageDimensions = useCallback(
    (image: EmbedImage, index: number, total: number) => {
      const aspectRatio = image.aspectRatio
        ? image.aspectRatio.width / image.aspectRatio.height
        : 1;

      let width: number;
      let height: number;

      if (total === 1) {
        // Single image - use full width with aspect ratio
        width = maxImageWidth;
        height = Math.min(width / aspectRatio, isDetailView ? 500 : 400);
      } else if (total === 2) {
        // Two images - side by side
        width = (maxImageWidth - 4) / 2;
        height = isDetailView ? 250 : 200;
      } else if (total === 3) {
        // Three images - first full width, others split
        if (index === 0) {
          width = maxImageWidth;
          height = isDetailView ? 250 : 200;
        } else {
          width = (maxImageWidth - 4) / 2;
          height = isDetailView ? 200 : 150;
        }
      } else {
        // Four or more images - 2x2 grid
        width = (maxImageWidth - 4) / 2;
        height = isDetailView ? 200 : 150;
      }

      return { width, height };
    },
    [isDetailView, maxImageWidth]
  );

  const handleImagePress = useCallback(
    (index: number) => {
      // Ensure destination has data before navigating to avoid transient empty shared tags
      setValue(images, index, `post-${images[index].fullsize}`);
      router.push({ pathname: "/viewer/image-post" });
    },
    [images, setValue]
  );

  if (!images || images.length === 0) {
    return null;
  }
  const renderImageGrid = () => {
    const totalImages = images.length;
    const displayImages = totalImages > 4 ? images.slice(0, 4) : images;

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
          {displayImages.map((image, index) => {
            const dimensions = calculateImageDimensions(image, index, 2);
            return (
              <ImageShareTransition
                onPress={() => handleImagePress(index)}
                key={index}
                image={image}
                dimensions={dimensions}
              />
            );
          })}
        </View>
      );
    }

    if (totalImages === 3) {
      const firstDimensions = calculateImageDimensions(images[0], 0, 3);
      return (
        <View style={styles.threeImageContainer}>
          <ImageShareTransition
            onPress={() => handleImagePress(0)}
            image={images[0]}
            dimensions={firstDimensions}
          />
          <View style={styles.bottomImagesContainer}>
            {images.slice(1).map((image, index) => {
              const dimensions = calculateImageDimensions(image, index + 1, 3);
              return (
                <ImageShareTransition
                  onPress={() => handleImagePress(index + 1)}
                  key={index + 1}
                  image={image}
                  dimensions={dimensions}
                />
              );
            })}
          </View>
        </View>
      );
    }

    // Four or more images - 2x2 grid
    if (displayImages.length === 4) {
      return (
        <View style={styles.gridContainer}>
          <View style={{ flexDirection: "row", marginBottom: 4 }}>
            {[0, 1].map((i) => {
              const dimensions = calculateImageDimensions(
                displayImages[i],
                i,
                4
              );
              return (
                <ImageShareTransition
                  onPress={() => handleImagePress(i)}
                  key={i}
                  image={displayImages[i]}
                  dimensions={dimensions}
                />
              );
            })}
          </View>
          <View style={{ flexDirection: "row" }}>
            {[2, 3].map((i) => {
              const dimensions = calculateImageDimensions(
                displayImages[i],
                i,
                4
              );
              return (
                <ImageShareTransition
                  key={i}
                  onPress={() => handleImagePress(i)}
                  image={displayImages[i]}
                  dimensions={dimensions}
                />
              );
            })}
          </View>
        </View>
      );
    }
    // Four or more images - 2x2 grid
    return (
      <View style={styles.gridContainer}>
        {displayImages.map((image, index) => {
          const dimensions = calculateImageDimensions(
            image,
            index,
            Math.min(totalImages, 4)
          );
          const isLastImage = index === 3 && totalImages > 4;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleImagePress(index)}
              activeOpacity={0.9}
              style={[
                styles.gridImageWrapper,
                {
                  marginRight: index % 2 === 0 ? 4 : 0,
                  marginBottom: index < 2 ? 4 : 0,
                },
              ]}
            >
              <Image
                source={{ uri: image.fullsize }}
                style={[styles.gridImage, dimensions]}
                contentFit="cover"
              />
              {isLastImage && (
                <View style={styles.moreImagesOverlay}>
                  <Text style={styles.moreImagesText}>+{totalImages - 4}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
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
  threeImageContainer: {
    flexDirection: "column",
  },
  firstImageWrapper: {
    marginBottom: 4,
  },
  bottomImagesContainer: {
    flexDirection: "row",
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
  moreImagesOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreImagesText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});
