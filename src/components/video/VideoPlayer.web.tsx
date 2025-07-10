import ReactPlayer from "react-player";
import React, { useState, memo, useRef, useCallback, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import VideoContainer from "./VideoContainer";
import { VideoPlayerProps } from "./type";
import VideoError from "./VideoError";
import { useLightBoxOpen } from "@/store/lightBox";

export const VideoPlayer = memo(function Comp({
  uri,
  aspectRatio,
  isDetailView = false,
  muted = true,
  autoPlay,
  shouldPlay,
  contentFit = "cover",
  containerStyle,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const playerRef = useRef<HTMLVideoElement>(null);
  const { isOpen: lightBoxOpen } = useLightBoxOpen();

  const isFocused = useIsFocused();

  useEffect(() => {
    if ((isFocused && shouldPlay && !lightBoxOpen) || autoPlay) {
      playerRef.current?.play();
    } else {
      playerRef.current?.pause();
    }
  }, [shouldPlay, isFocused, autoPlay, lightBoxOpen]);

  // Retry handler
  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
  }, []);

  const objectFit = contentFit === "contain" ? "contain" : "cover";

  if (hasError) {
    return <VideoError onRetry={handleRetry} />;
  }

  return (
    <VideoContainer
      loading={isLoading}
      aspectRatio={aspectRatio}
      containerStyle={containerStyle}
      isDetailView={isDetailView}
    >
      <ReactPlayer
        ref={playerRef}
        src={uri}
        width="100%"
        height="100%"
        loop
        muted={muted}
        controls
        playsInline
        style={{ objectFit }}
        onReady={() => setIsLoading(false)}
        onLoadedData={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </VideoContainer>
  );
});
