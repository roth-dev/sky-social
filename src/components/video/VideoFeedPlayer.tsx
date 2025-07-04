import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  Pressable,
} from "react-native";
import { useEvent, useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { Play, Pause, VolumeX, Volume2 } from "lucide-react-native";

interface VideoFeedPlayerProps {
  uri: string;
  thumbnail?: string;
  aspectRatio?: { width: number; height: number };
  isActive: boolean;
  autoPlay?: boolean;
  muted?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export function VideoFeedPlayer({
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
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

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
    if (isActive && autoPlay && !hasError) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, autoPlay, hasError, player]);

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

  // Calculate video dimensions to fit screen
  const getVideoDimensions = useCallback(() => {
    if (!aspectRatio) {
      return { width: screenWidth, height: screenHeight };
    }

    const videoAspectRatio = aspectRatio.width / aspectRatio.height;
    const screenAspectRatio = screenWidth / screenHeight;

    if (videoAspectRatio > screenAspectRatio) {
      // Video is wider than screen - fit to height
      const height = screenHeight;
      const width = height * videoAspectRatio;
      return { width, height };
    } else {
      // Video is taller than screen - fit to width
      const width = screenWidth;
      const height = width / videoAspectRatio;
      return { width, height };
    }
  }, [aspectRatio]);

  const videoDimensions = getVideoDimensions();

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
      <Pressable style={styles.videoWrapper} onPress={handleVideoPress}>
        <VideoView
          ref={videoRef}
          style={[
            styles.video,
            {
              width: videoDimensions.width,
              height: videoDimensions.height,
            },
          ]}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          contentFit="cover"
          playsInline
        />

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingSpinner} />
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Play/Pause Button */}
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={togglePlayPause}
            >
              {isPlaying ? (
                <Pause size={48} color="#ffffff" fill="#ffffff" />
              ) : (
                <Play size={48} color="#ffffff" fill="#ffffff" />
              )}
            </TouchableOpacity>

            {/* Mute Button */}
            <TouchableOpacity
              style={styles.muteButton}
              onPress={toggleMute}
            >
              {muted ? (
                <VolumeX size={24} color="#ffffff" />
              ) : (
                <Volume2 size={24} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  videoWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  video: {
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