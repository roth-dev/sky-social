import React, { useState, useRef, useEffect, memo } from "react";
import { StyleSheet } from "react-native";
import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useIsFocused } from "@react-navigation/native";
import VideoContainer from "./VideoContainer";
import { VideoPlayerProps } from "./type";
import VideoError from "./VideoError";
import { useLightBoxOpen } from "@/store/lightBox";
import { isAndroid } from "@/platform";

export const VideoPlayer = memo(function Comp({
  uri,
  aspectRatio,
  isDetailView = false,
  shouldPlay,
  contentFit = "cover",
  containerStyle,
}: VideoPlayerProps) {
  const videoRef = useRef<VideoView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { isOpen } = useLightBoxOpen();

  const player = useVideoPlayer(
    {
      uri,
      contentType: "hls",
    },
    (player) => {
      player.loop = true;
    }
  );

  const isFocused = useIsFocused();

  useEffect(() => {
    if (shouldPlay && isFocused && !isOpen && !isAndroid) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, isFocused, player, isOpen]);

  // Listen for duration and loading/error status
  useEventListener(player, "sourceLoad", () => {
    setIsLoading(false);
  });

  useEventListener(player, "statusChange", ({ status }) => {
    if (status === "loading") {
      setIsLoading(true);
    } else if (status === "readyToPlay") {
      setIsLoading(false);
    } else if (status === "error") {
      setHasError(true);
      setIsLoading(false);
    }
  });

  if (hasError) {
    return <VideoError onRetry={() => {}} />;
  }

  return (
    <VideoContainer
      loading={isLoading}
      aspectRatio={aspectRatio}
      containerStyle={containerStyle}
      isDetailView={isDetailView}
    >
      <VideoView
        ref={videoRef}
        style={styles.video}
        player={player}
        allowsPictureInPicture={false}
        contentFit={contentFit}
        playsInline
        nativeControls={false}
        allowsVideoFrameAnalysis
      />
    </VideoContainer>
  );
});

const styles = StyleSheet.create({
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
  },
});
