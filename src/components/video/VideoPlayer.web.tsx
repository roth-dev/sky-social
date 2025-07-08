import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  CSSProperties,
  memo,
} from "react";
import ReactPlayer from "react-player";
import { View } from "../ui/View";
import Loading from "../ui/Loading";
import { Colors } from "@/constants/colors";
import { useIsFocused } from "@react-navigation/native";

export interface VideoPlayerProps {
  uri: string;
  thumbnail?: string;
  aspectRatio?: { width: number; height: number };
  isDetailView?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  shouldPlay?: boolean;
  contentFit?: "cover" | "contain";
  onPlaybackStatusUpdate?: (status: any) => void;
  containerStyle?: CSSProperties;
}

const screenWidth = typeof window !== "undefined" ? window.innerWidth : 360;

export const VideoPlayer = memo(function Comp({
  uri,
  aspectRatio,
  isDetailView = false,
  autoPlay = true,
  muted = true,
  shouldPlay,
  contentFit = "cover",
  onPlaybackStatusUpdate,
  containerStyle,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(!!autoPlay || !!shouldPlay);
  // Remove the ref from Player, as it's not needed for this implementation
  // const playerRef = useRef<typeof Player>(null);
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
    const maxHeight = isDetailView ? 500 : 400;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * videoAspectRatio;
    }
    return { width, height };
  }, [aspectRatio, isDetailView]);

  // Sync play/pause with shouldPlay
  useEffect(() => {
    if (typeof shouldPlay === "boolean") {
      setIsPlaying(shouldPlay);
    }
  }, [shouldPlay]);

  // Playback status callback
  useEffect(() => {
    if (onPlaybackStatusUpdate) {
      onPlaybackStatusUpdate({
        isLoaded: !isLoading && !hasError,
        error: hasError ? "Error loading video" : undefined,
        isPlaying,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, hasError, isPlaying]);

  // Retry handler
  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
  };

  // Map contentFit to objectFit
  const objectFit = contentFit === "contain" ? "contain" : "cover";

  if (hasError) {
    return (
      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
          height: dimensions.height,
          ...containerStyle,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.background.secondary.light,
            gap: 16,
            height: "100%",
          }}
        >
          <span style={{ fontSize: 16, color: "#6b7280", textAlign: "center" }}>
            Unable to load video
          </span>
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: Colors.primary,
              borderRadius: 8,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReactPlayer
        src={uri}
        width="100%"
        height="100%"
        playing={isPlaying}
        loop
        muted={muted}
        controls
        style={{ objectFit }}
        onReady={() => setIsLoading(false)}
        onLoadedData={() => setIsLoading(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <div className=" absolute top-0 left-0 right-0 bottom-0 bg-black items-center flex justify-center">
          <Loading size="lg" />
        </div>
      )}
    </>
  );
});
