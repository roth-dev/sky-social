import React, { useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";
import { EmbedImage } from "@/types/embed";
import { Image } from "expo-image";

interface ImageEmbedProps {
  images: EmbedImage[];
  isDetailView?: boolean;
  onImagePress?: (images: EmbedImage[], index: number) => void;
}

const { width: screenWidth } = Dimensions.get("window");
const MAX_IMAGE_WIDTH = screenWidth - 32; // Account for padding

export function ImageEmbed({
  images,
  isDetailView = false,
  onImagePress,
}: ImageEmbedProps) {
  if (!images || images.length === 0) {
    return null;
  }

  const calculateImageDimensions = useCallback(
    (image: EmbedImage, index: number, total: number) => {
      const aspectRatio = image.aspectRatio
        ? image.aspectRatio.width / image.aspectRatio.height
        : 1;

      let width: number;
      let height: number;

      if (total === 1) {
        // Single image - use full width with aspect ratio
        width = MAX_IMAGE_WIDTH;
        height = Math.min(width / aspectRatio, isDetailView ? 500 : 400);
      } else if (total === 2) {
        // Two images - side by side
        width = (MAX_IMAGE_WIDTH - 4) / 2;
        height = isDetailView ? 250 : 200;
      } else if (total === 3) {
        // Three images - first full width, others split
        if (index === 0) {
          width = MAX_IMAGE_WIDTH;
          height = isDetailView ? 250 : 200;
        } else {
          width = (MAX_IMAGE_WIDTH - 4) / 2;
          height = isDetailView ? 200 : 150;
        }
      } else {
        // Four or more images - 2x2 grid
        width = (MAX_IMAGE_WIDTH - 4) / 2;
        height = isDetailView ? 200 : 150;
      }

      return { width, height };
    },
    []
  );

  const handleImagePress = (index: number) => {
    onImagePress?.(images, index);
  };

  const renderImageGrid = () => {
    const totalImages = images.length;
    const displayImages = totalImages > 4 ? images.slice(0, 4) : images;

    if (totalImages === 1) {
      const dimensions = calculateImageDimensions(images[0], 0, 1);
      return (
        <TouchableOpacity
          onPress={() => handleImagePress(0)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: images[0].fullsize }}
            style={[styles.singleImage, dimensions]}
            contentFit="cover"
          />
        </TouchableOpacity>
      );
    }

    if (totalImages === 2) {
      return (
        <View style={styles.twoImageContainer}>
          {displayImages.map((image, index) => {
            const dimensions = calculateImageDimensions(image, index, 2);
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleImagePress(index)}
                activeOpacity={0.9}
                style={[
                  styles.imageWrapper,
                  { marginRight: index === 0 ? 4 : 0 },
                ]}
              >
                <Image
                  source={{ uri: image.fullsize }}
                  style={[styles.gridImage, dimensions]}
                  contentFit="cover"
                />
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (totalImages === 3) {
      const firstDimensions = calculateImageDimensions(images[0], 0, 3);
      return (
        <View style={styles.threeImageContainer}>
          <TouchableOpacity
            onPress={() => handleImagePress(0)}
            activeOpacity={0.9}
            style={styles.firstImageWrapper}
          >
            <Image
              source={{ uri: images[0].fullsize }}
              style={[styles.gridImage, firstDimensions]}
              contentFit="cover"
            />
          </TouchableOpacity>
          <View style={styles.bottomImagesContainer}>
            {images.slice(1).map((image, index) => {
              const dimensions = calculateImageDimensions(image, index + 1, 3);
              return (
                <TouchableOpacity
                  key={index + 1}
                  onPress={() => handleImagePress(index + 1)}
                  activeOpacity={0.9}
                  style={[
                    styles.imageWrapper,
                    { marginRight: index === 0 ? 4 : 0 },
                  ]}
                >
                  <Image
                    source={{ uri: image.fullsize }}
                    style={[styles.gridImage, dimensions]}
                    contentFit="cover"
                  />
                </TouchableOpacity>
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
