import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useEvent, useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useNavigation } from "expo-router";

interface VideoFeedPlayerProps {
  uri: string;
  thumbnail?: string;
  aspectRatio?: { width: number; height: number };
  isActive: boolean;
  autoPlay?: boolean;
  muted?: boolean;
}

const VideoPlayer = memo(function Comp({
  uri,
  thumbnail,
  aspectRatio,
  isActive,
  autoPlay = true,
  muted: initialMuted = true,
}: VideoFeedPlayerProps) {
  const videoRef = useRef<VideoView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [muted, setMuted] = useState(initialMuted);
  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const navigation = useNavigation();

  const player = useVideoPlayer(
    {
      uri,
      contentType: "hls",
    },
    (player) => {
      player.loop = true;
      player.muted = muted;
    }
  );

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // Auto-play/pause based on active state
  useEffect(() => {
    if (isActive && autoPlay && !hasError && navigation.isFocused()) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, autoPlay, hasError, player, navigation]);

  // Update muted state
  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  // Listen for video events
  useEventListener(player, "sourceLoad", () => {
    setIsLoading(false);
    setHasError(false);
  });

  useEventListener(player, "statusChange", ({ status, error }) => {
    if (status === "loading") {
      setIsLoading(true);
    } else if (status === "readyToPlay") {
      setIsLoading(false);
      setHasError(false);
    } else if (status === "error") {
      setHasError(true);
      setIsLoading(false);
      console.error("Video error:", error);
    }
  });

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPlaying, player]);

  const toggleMute = useCallback(() => {
    setMuted(!muted);
  }, [muted]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);

    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    setControlsTimeout(timeout);
  }, [controlsTimeout]);

  const handleVideoPress = useCallback(() => {
    if (showControls) {
      togglePlayPause();
    } else {
      showControlsTemporarily();
    }
  }, [showControls, togglePlayPause, showControlsTemporarily]);

  if (hasError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load video</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
              player.replay();
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoView
        ref={videoRef}
        style={styles.video}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        playsInline
      />
    </View>
  );
});

export { VideoPlayer };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  muteButton: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#ffffff",
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
