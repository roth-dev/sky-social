import { Video } from "react-native-compressor";

export interface CompressionProgress {
  progress: number;
}

export interface CompressedVideoResult {
  uri: string;
}

export class VideoCompressor {
  /**
   * Compress a video file with progress tracking
   */
  static async compressVideo(
    videoUri: string,
    onProgress?: (progress: CompressionProgress) => void
  ): Promise<CompressedVideoResult> {
    try {
      const result = await Video.compress(videoUri, {}, (progress: number) => {
        if (onProgress) {
          onProgress({
            progress: progress * 100,
          });
        }
      });

      return {
        uri: result,
      };
    } catch (error) {
      console.error("VideoCompressor: Compression failed:", error);
      throw new Error(`Video compression failed: ${error}`);
    }
  }

  /**
   * Cancel ongoing compression
   */
  static async cancelCompression(cancellationId: string): Promise<void> {
    try {
      await Video.cancelCompression(cancellationId);
    } catch (error) {
      console.error("Failed to cancel compression:", error);
    }
  }
}
