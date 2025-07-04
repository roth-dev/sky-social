import React, { useState, useCallback } from "react";
import {
  View,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Text,
  SafeAreaView,
  Platform,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { X, Download, Share, MoreHorizontal } from "lucide-react-native";
import { Image } from "expo-image";
import { isWeb } from "@/platform";

interface LightBoxProps {
  visible: boolean;
  images: Array<{
    uri: string;
    alt?: string;
    aspectRatio?: { width: number; height: number };
  }>;
  initialIndex?: number;
  onClose: () => void;
  onShare?: (imageUri: string, index: number) => void;
  onDownload?: (imageUri: string, index: number) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const HEADER_HEIGHT = 60;
const FOOTER_HEIGHT = 80;

export function LightBox({
  visible,
  images,
  initialIndex = 0,
  onClose,
  onShare,
  onDownload,
}: LightBoxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [headerVisible, setHeaderVisible] = useState(true);

  // Animation values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const headerOpacity = useSharedValue(1);

  const currentImage = images[currentIndex];

  // Calculate image dimensions
  const getImageDimensions = useCallback(
    (aspectRatio?: { width: number; height: number }) => {
      if (!aspectRatio) {
        return { width: screenWidth, height: screenHeight * 0.7 };
      }

      const imageAspectRatio = aspectRatio.width / aspectRatio.height;
      const screenAspectRatio =
        screenWidth / (screenHeight - HEADER_HEIGHT - FOOTER_HEIGHT);

      if (imageAspectRatio > screenAspectRatio) {
        // Image is wider than screen
        const width = screenWidth;
        const height = width / imageAspectRatio;
        return { width, height };
      } else {
        // Image is taller than screen
        const height = screenHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
        const width = height * imageAspectRatio;
        return { width, height };
      }
    },
    []
  );

  const imageDimensions = getImageDimensions(currentImage?.aspectRatio);

  // Reset animation values when image changes
  React.useEffect(() => {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    savedTranslateX.value = 0;
    translateY.value = 0;
    savedTranslateY.value = 0;
  }, [currentIndex]);

  // Reset animation values when LightBox is opened
  React.useEffect(() => {
    if (visible) {
      scale.value = 1;
      savedScale.value = 1;
      translateX.value = 0;
      savedTranslateX.value = 0;
      translateY.value = 0;
      savedTranslateY.value = 0;
      opacity.value = 1;
    }
  }, [visible]);

  // Define toggleHeader function with useCallback
  const toggleHeader = useCallback(() => {
    const newVisible = !headerVisible;
    setHeaderVisible(newVisible);
    headerOpacity.value = withTiming(newVisible ? 1 : 0, { duration: 200 });
  }, [headerVisible, headerOpacity]);

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        savedTranslateX.value = 0;
        translateY.value = withTiming(0);
        savedTranslateY.value = 0;
      } else if (scale.value > 3) {
        scale.value = withTiming(3);
        savedScale.value = 3;
      } else {
        savedScale.value = scale.value;
      }
    });

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        // Pan when zoomed in
        const maxTranslateX =
          (imageDimensions.width * scale.value - screenWidth) / 2;
        const maxTranslateY =
          (imageDimensions.height * scale.value -
            (screenHeight - HEADER_HEIGHT - FOOTER_HEIGHT)) /
          2;
        translateX.value = Math.max(
          -maxTranslateX,
          Math.min(maxTranslateX, savedTranslateX.value + e.translationX)
        );
        translateY.value = Math.max(
          -maxTranslateY,
          Math.min(maxTranslateY, savedTranslateY.value + e.translationY)
        );
      } else {
        // Dismiss gesture when not zoomed
        translateY.value = savedTranslateY.value + e.translationY;
        const progress = Math.abs(translateY.value) / (screenHeight / 3);
        opacity.value = interpolate(progress, [0, 1], [1, 0.3], "clamp");
      }
    })
    .onEnd((e) => {
      if (scale.value <= 1) {
        // Handle dismiss gesture
        const shouldDismiss =
          Math.abs(translateY.value) > screenHeight / 4 ||
          Math.abs(e.velocityY) > 1000;
        if (shouldDismiss) {
          runOnJS(onClose)();
        } else {
          translateY.value = withTiming(0);
          opacity.value = withTiming(1);
          savedTranslateY.value = 0;
        }
      } else {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  // Single tap gesture
  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(toggleHeader)();
    });

  // Double tap gesture
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd((e) => {
      if (scale.value > 1) {
        // Zoom out
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        savedTranslateX.value = 0;
        translateY.value = withTiming(0);
        savedTranslateY.value = 0;
      } else {
        // Zoom in to tap location
        const newScale = 2;
        scale.value = withTiming(newScale);
        savedScale.value = newScale;
        // Center on tap point
        const tapX = e.x - screenWidth / 2;
        const tapY = e.y - (screenHeight - HEADER_HEIGHT - FOOTER_HEIGHT) / 2;
        translateX.value = withTiming(-tapX * (newScale - 1));
        savedTranslateX.value = -tapX * (newScale - 1);
        translateY.value = withTiming(-tapY * (newScale - 1));
        savedTranslateY.value = -tapY * (newScale - 1);
      }
    });

  // Compose gestures
  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    Gesture.Exclusive(doubleTapGesture, singleTapGesture)
  );

  // Animated styles
  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const handleShare = () => {
    if (onShare && currentImage) {
      onShare(currentImage.uri, currentIndex);
    }
  };

  const handleDownload = () => {
    if (onDownload && currentImage) {
      onDownload(currentImage.uri, currentIndex);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!visible || !currentImage) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar hidden={!headerVisible} />

      <Animated.View style={[styles.backdrop, containerAnimatedStyle]}>
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <SafeAreaView style={styles.headerContent}>
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              {/* <Text style={styles.headerTitle}>
                {currentImage.alt || `Image ${currentIndex + 1}`}
              </Text> */}
              <Text style={styles.headerSubtitle}>
                {currentIndex + 1} of {images.length}
              </Text>
            </View>

            <TouchableOpacity style={styles.headerButton}>
              <MoreHorizontal size={24} color="#ffffff" />
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>

        {/* Image Container */}
        <View style={styles.imageContainer}>
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={styles.imageWrapper}>
              <Animated.View style={imageAnimatedStyle}>
                <Image
                  source={{ uri: currentImage.uri }}
                  style={[
                    styles.image,
                    {
                      width: imageDimensions.width,
                      height: imageDimensions.height,
                    },
                  ]}
                  contentFit="contain"
                />
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Navigation Arrows */}
        {images.length > 1 && isWeb && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={goToPrevious}
              >
                <View style={styles.navButtonInner}>
                  <Text style={styles.navButtonText}>‹</Text>
                </View>
              </TouchableOpacity>
            )}

            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonRight]}
                onPress={goToNext}
              >
                <View style={styles.navButtonInner}>
                  <Text style={styles.navButtonText}>›</Text>
                </View>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Footer */}
        <Animated.View style={[styles.footer, headerAnimatedStyle]}>
          <SafeAreaView style={styles.footerContent}>
            <View style={styles.footerActions}>
              {onDownload && (
                <TouchableOpacity
                  style={styles.footerButton}
                  onPress={handleDownload}
                >
                  <Download size={24} color="#ffffff" />
                </TouchableOpacity>
              )}

              {onShare && (
                <TouchableOpacity
                  style={styles.footerButton}
                  onPress={handleShare}
                >
                  <Share size={24} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>

            {/* Image Indicators */}
            {images.length > 1 && (
              <View style={styles.indicators}>
                {images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentIndex && styles.indicatorActive,
                    ]}
                    onPress={() => setCurrentIndex(index)}
                  />
                ))}
              </View>
            )}
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: HEADER_HEIGHT,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: HEADER_HEIGHT,
    paddingBottom: FOOTER_HEIGHT,
  },
  imageWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    backgroundColor: "transparent",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
  navButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  navButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "300",
    marginTop: Platform.OS === "ios" ? -2 : 0,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  footerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: FOOTER_HEIGHT,
  },
  footerActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 16,
  },
  footerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  indicatorActive: {
    backgroundColor: "#ffffff",
  },
});
