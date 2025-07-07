import React, { useState, useRef, useEffect, useMemo, memo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  ViewStyle,
  Platform,
} from "react-native";
import { useEvent, useEventListener } from "expo";
import { useVideoPlayer, VideoContentFit, VideoView } from "expo-video";
import { useIsFocused } from "@react-navigation/native";
import Loading from "../ui/Loading";
interface VideoPlayerProps {
  uri: string;
  thumbnail?: string;
  aspectRatio?: { width: number; height: number };
  isDetailView?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  shouldPlay?: boolean;
  contentFit?: VideoContentFit;
  onPlaybackStatusUpdate?: (status: any) => void;
  containerStyle?: ViewStyle | ViewStyle[];
}

const { width: screenWidth } = Dimensions.get("window");

export const VideoPlayer = memo(function Comp({
  uri,
  aspectRatio,
  isDetailView = false,
  shouldPlay,
  contentFit = "cover",
  onPlaybackStatusUpdate,
  containerStyle,
}: VideoPlayerProps) {
  const videoRef = useRef<VideoView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const player = useVideoPlayer(
    {
      uri,
      contentType: "hls",
    },
    (player) => {
      player.loop = true;
      if (Platform.OS === "web") player.muted = true;
    }
  );

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const isFocused = useIsFocused();

  // Calculate video dimensions
  const dimensions = useMemo(() => {
    const maxWidth = screenWidth - 32;
    const defaultAspectRatio = 16 / 9;
    const videoAspectRatio = aspectRatio
      ? aspectRatio.width / aspectRatio.height
      : defaultAspectRatio;

    let width = maxWidth;
    let height = width / videoAspectRatio;

    // Limit height for better UX
    const maxHeight = isDetailView ? 500 : 400;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * videoAspectRatio;
    }

    return { width, height };
  }, [aspectRatio, isDetailView, screenWidth]);

  useEffect(() => {
    if (shouldPlay && isFocused) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, isFocused]);

  // Listen for duration and loading/error status
  useEventListener(player, "sourceLoad", () => {
    setIsLoading(false);
  });

  useEventListener(player, "statusChange", ({ status, error }) => {
    if (status === "loading") {
      setIsLoading(true);
    } else if (status === "readyToPlay") {
      setIsLoading(false);
    } else if (status === "error") {
      setHasError(true);
      setIsLoading(false);
    }
    if (onPlaybackStatusUpdate) {
      // Provide a compatible payload for legacy consumers
      onPlaybackStatusUpdate({
        isLoaded: status === "readyToPlay",
        error: error?.message,
        isPlaying,
        // Add more fields if needed for compatibility
      });
    }
  });

  if (hasError) {
    return (
      <View
        style={[
          styles.container,
          { height: dimensions.height },
          containerStyle,
        ]}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load video</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <View
      style={[styles.container, { height: dimensions.height }, containerStyle]}
    >
      <VideoView
        ref={videoRef}
        style={styles.video}
        player={player}
        allowsPictureInPicture={false}
        contentFit={contentFit}
        playsInline
        allowsVideoFrameAnalysis
        // Remove 'muted' prop, not supported by VideoView
      />

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Loading size="lg" />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderTopColor: "#ffffff",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
