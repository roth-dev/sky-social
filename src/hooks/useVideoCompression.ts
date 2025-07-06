import { useState, useCallback } from "react";
import { Video } from "react-native-compressor";
import { Alert } from "react-native";

export interface VideoCompressionState {
  isCompressing: boolean;
  progress: number;
  compressedUri: string | null;
  error: string | null;
}

export const useVideoCompression = () => {
  const [state, setState] = useState<VideoCompressionState>({
    isCompressing: false,
    progress: 0,
    compressedUri: null,
    error: null,
  });

  const compressVideo = useCallback(async (videoUri: string) => {
    try {
      setState((prev) => ({
        ...prev,
        isCompressing: true,
        progress: 0,
        error: null,
      }));

      console.log("Starting video compression for:", videoUri);

      const result = await Video.compress(
        videoUri,
        {
          bitrate: 1000000,
          compressionMethod: "manual",
          maxSize: 1000000,
          minimumFileSizeForCompress: 1000000,
          getCancellationId: (cancellationId: string) => {
            setState((prev) => ({
              ...prev,
              cancellationId,
            }));
          },
          downloadProgress: (progress: number) => {
            setState((prev) => ({
              ...prev,
              progress,
            }));
          },
        },
        (progress: number) => {
          setState((prev) => ({
            ...prev,
            progress,
          }));
        }
      );

      console.log("Video compression completed:", result);

      setState((prev) => ({
        ...prev,
        isCompressing: false,
        progress: 100,
        compressedUri: result,
      }));

      return result;
    } catch (error) {
      console.error("Video compression failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      setState((prev) => ({
        ...prev,
        isCompressing: false,
        error: errorMessage,
      }));

      Alert.alert(
        "Compression Failed",
        "Failed to compress video. Please try again."
      );
      throw error;
    }
  }, []);

  const cancelCompression = useCallback(async (cancellationId: string) => {
    try {
      await Video.cancelCompression(cancellationId);
      setState((prev) => ({
        ...prev,
        isCompressing: false,
        progress: 0,
      }));
    } catch (error) {
      console.error("Failed to cancel compression:", error);
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isCompressing: false,
      progress: 0,
      compressedUri: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    compressVideo,
    cancelCompression,
    reset,
  };
};
