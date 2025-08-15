import { AtpAgent, BlobRef } from "@atproto/api";
import { logger } from "@/utils/logger";
import { getErrorMessage } from "@/utils/errorUtils";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";
import { getThumbnailAsync } from "expo-video-thumbnails";
/**
 * Normalize a URI to a format compatible with FileSystem
 * Handles content://, file://, assets-library:// URIs properly
 */
async function normalizeFileUri(uri: string): Promise<string> {
  try {
    // If already a valid file URI, return it
    if (uri.startsWith("file://")) {
      return uri;
    }

    // Handle content:// URIs on Android
    if (Platform.OS === "android" && uri.startsWith("content://")) {
      try {
        // Try to get a filesystem URI
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists) {
          return uri;
        }
      } catch (error) {
        // Failed to read as-is, need to copy to app's cache
        logger.log("Copying content URI to cache directory", {
          uri,
          error: getErrorMessage(error),
        });
      }

      // Copy the file to cache directory to get a file:// URI
      const fileExt = uri.split(".").pop() || "tmp";
      const destination = `${
        FileSystem.cacheDirectory
      }upload-${Date.now()}.${fileExt}`;
      await FileSystem.copyAsync({ from: uri, to: destination });
      return destination;
    }

    // Handle iOS assets-library:// URIs
    if (Platform.OS === "ios" && uri.startsWith("assets-library://")) {
      // For iOS asset URLs, we can use them directly but may need to strip the prefix
      return uri;
    }

    return uri;
  } catch (error) {
    logger.error("Failed to normalize file URI", { uri, error });
    return uri; // Return original as fallback
  }
}

/**
 * Utility to pick images from the device library or camera
 */
export async function pickImage(options: {
  mediaTypes?: ImagePicker.MediaTypeOptions;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  allowsMultipleSelection?: boolean;
  fromCamera?: boolean;
}) {
  try {
    // Get permission first
    if (options.fromCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        logger.warn("Camera permission denied");
        return { success: false, error: "Camera permission denied" };
      }
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        logger.warn("Media library permission denied");
        return { success: false, error: "Media library permission denied" };
      }
    }

    // Set up picker options
    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.All,
      allowsEditing: options.allowsEditing !== false,
      aspect: options.aspect,
      quality: options.quality || 0.8,
      allowsMultipleSelection: options.allowsMultipleSelection || false,
    };

    // Launch picker
    const result = options.fromCamera
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (result.canceled) {
      return { success: false, error: "User cancelled operation" };
    }

    const assets = result.assets || [];
    if (assets.length === 0) {
      return { success: false, error: "No assets selected" };
    }

    return {
      success: true,
      assets: assets.map((asset) => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        type: asset.type,
        fileName: asset.fileName,
        mimeType: asset.mimeType || getMimeTypeFromUri(asset.uri),
      })),
    };
  } catch (error) {
    logger.error("Error picking image", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Guess MIME type from file URI
 */
function getMimeTypeFromUri(uri: string): string {
  const extension = uri.split(".").pop()?.toLowerCase();
  if (!extension) return "application/octet-stream";

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "heic":
      return "image/heic";
    default:
      return "application/octet-stream";
  }
}

/**
 * Compress an image to reduce file size for upload
 */
export async function compressImage(
  uri: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "jpeg" | "png";
  }
): Promise<{ success: boolean; uri?: string; error?: string }> {
  try {
    // Use the imports from the top of the file
    const normalizedUri = await normalizeFileUri(uri);
    const format = options?.format || "jpeg";

    const result = await ImageManipulator.manipulateAsync(
      normalizedUri,
      [
        ...(options?.width || options?.height
          ? [
              {
                resize: {
                  width: options?.width,
                  height: options?.height,
                },
              },
            ]
          : []),
      ],
      {
        compress: options?.quality || 0.8,
        format:
          format === "jpeg"
            ? ImageManipulator.SaveFormat.JPEG
            : ImageManipulator.SaveFormat.PNG,
      }
    );

    return { success: true, uri: result.uri };
  } catch (error) {
    logger.error("Failed to compress image", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export interface UploadBlobResult {
  success: boolean;
  blob?: BlobRef;
  error?: string;
}

export type ProgressCallback = (progress: {
  percent: number;
  loaded: number;
  total: number;
}) => void;

export interface ImageBlob extends UploadBlobResult {
  blob?: UploadBlobResult["blob"];
  aspectRatio?: {
    width: number;
    height: number;
  };
}

export interface VideoBlob extends UploadBlobResult {
  blob?: UploadBlobResult["blob"];
  aspectRatio?: {
    width: number;
    height: number;
  };
}

/**
 * Upload a blob (image or video) to AT Protocol using expo-file-system
 * @param agent - AT Protocol agent
 * @param uri - File URI to upload
 * @param mimeType - MIME type of the file
 * @param onProgress - Optional callback for tracking upload progress
 */
export async function uploadBlob(
  agent: AtpAgent,
  uri: string,
  mimeType: string,
  onProgress?: ProgressCallback
): Promise<UploadBlobResult> {
  try {
    logger.log("uploadBlob", { uri, mimeType });

    // Normalize file URI for different platforms and URI formats
    const fileUri = await normalizeFileUri(uri);

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error(`File not found at path: ${fileUri}`);
    }

    logger.log("File size", { size: fileInfo.size });

    // Set up progress tracking
    const fileSize = fileInfo.size || 0;

    // Helper to report progress
    const reportProgress = (loaded: number) => {
      if (onProgress && fileSize > 0) {
        const percent = Math.min(Math.round((loaded / fileSize) * 100), 100);
        onProgress({
          percent,
          loaded,
          total: fileSize,
        });
      }
    };

    // For small files, read directly into memory
    if (fileInfo.size && fileInfo.size < 5 * 1024 * 1024) {
      // Less than 5MB
      // Initial progress update
      reportProgress(0);

      // Read file as base64
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Update progress after reading file
      reportProgress(fileSize * 0.5); // 50% progress after reading

      // Convert base64 to Uint8Array
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const uint8Array = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }

      // Update progress before actual upload
      reportProgress(fileSize * 0.75); // 75% progress before network upload

      // Upload the blob to AT Protocol
      const uploadResult = await agent.uploadBlob(uint8Array, {
        encoding: mimeType,
      });

      if (!uploadResult.success) {
        throw new Error("Blob upload failed");
      }

      // Final progress update
      reportProgress(fileSize);

      return {
        success: true,
        blob: uploadResult.data.blob,
      };
    } else {
      // For larger files, use streaming approach with chunks
      // Initial progress update
      reportProgress(0);

      // Read the file in chunks to avoid memory issues
      const fileData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
        length: fileInfo.size,
      });

      // Update progress after reading file
      reportProgress(fileSize * 0.4); // 40% progress after reading large file

      // Convert to Uint8Array
      const uint8Array = Uint8Array.from(atob(fileData), (c) =>
        c.charCodeAt(0)
      );

      // Update progress before actual upload
      reportProgress(fileSize * 0.6); // 60% progress before network upload

      // Upload the blob to AT Protocol
      const uploadResult = await agent.uploadBlob(uint8Array, {
        encoding: mimeType,
      });

      if (!uploadResult.success) {
        throw new Error("Large blob upload failed");
      }

      // Final progress update
      reportProgress(fileSize);

      return {
        success: true,
        blob: uploadResult.data.blob,
      };
    }
  } catch (error: unknown) {
    logger.error("uploadBlob failed", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Upload multiple images and return their blob references
 * @param agent - AT Protocol agent
 * @param images - Array of images to upload
 * @param onProgress - Optional callback for tracking overall upload progress
 */
export async function uploadImages(
  agent: AtpAgent,
  images: { uri: string; alt?: string }[],
  onProgress?: ProgressCallback
): Promise<{
  success: boolean;
  images?: Array<{
    alt: string;
    image: BlobRef;
    aspectRatio?: {
      width: number;
      height: number;
    };
  }>;
  error?: string;
}> {
  try {
    logger.log("uploadImages", { count: images.length });

    // Setup progress tracking for multiple images
    const totalImages = images.length;
    const imageProgressWeight = 1 / totalImages;

    const uploadPromises = images.map(async (img, index) => {
      // Determine MIME type based on file extension
      const extension = img.uri.split(".").pop()?.toLowerCase();
      let mimeType = "image/jpeg"; // default

      switch (extension) {
        case "png":
          mimeType = "image/png";
          break;
        case "gif":
          mimeType = "image/gif";
          break;
        case "webp":
          mimeType = "image/webp";
          break;
        default:
          mimeType = "image/jpeg";
      }

      // Track individual image progress
      const handleImageProgress = onProgress
        ? (progress: { percent: number; loaded: number; total: number }) => {
            // Calculate this image's contribution to total progress
            const imageContribution =
              (progress.percent / 100) * imageProgressWeight;
            const baseProgress = index * imageProgressWeight;
            const overallPercent = Math.round(
              (baseProgress + imageContribution) * 100
            );

            // Report overall progress
            onProgress({
              percent: overallPercent,
              loaded: 0, // These values are not meaningful for multiple uploads
              total: 100,
            });
          }
        : undefined;

      const uploadResult = await uploadBlob(
        agent,
        img.uri,
        mimeType,
        handleImageProgress
      );

      if (!uploadResult.success || !uploadResult.blob) {
        throw new Error(`Failed to upload image: ${uploadResult.error}`);
      }

      // Get image dimensions for aspect ratio
      const dimensions = await getImageDimensions(img.uri);

      return {
        alt: img.alt || "",
        image: uploadResult.blob,
        aspectRatio: dimensions
          ? {
              width: dimensions.width,
              height: dimensions.height,
            }
          : undefined,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    return {
      success: true,
      images: uploadedImages,
    };
  } catch (error: unknown) {
    logger.error("uploadImages failed", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Upload a video and return its blob reference with dimensions
 * @param agent - AT Protocol agent
 * @param videoUri - Video URI to upload
 * @param alt - Optional alt text for the video
 * @param onProgress - Optional callback for tracking upload progress
 */
export async function uploadVideo(
  agent: AtpAgent,
  videoUri: string,
  alt?: string,
  onProgress?: ProgressCallback
): Promise<{
  success: boolean;
  blob?: BlobRef;
  aspectRatio?: {
    width: number;
    height: number;
  };
  error?: string;
}> {
  try {
    logger.log("uploadVideo", { videoUri, alt });

    // Determine MIME type based on file extension
    const extension = videoUri.split(".").pop()?.toLowerCase();
    let mimeType = "video/mp4"; // default

    switch (extension) {
      case "mov":
        mimeType = "video/quicktime";
        break;
      case "avi":
        mimeType = "video/avi";
        break;
      case "mkv":
        mimeType = "video/x-matroska";
        break;
      case "webm":
        mimeType = "video/webm";
        break;
      default:
        mimeType = "video/mp4";
    }

    const uploadResult = await uploadBlob(
      agent,
      videoUri,
      mimeType,
      onProgress
    );

    if (!uploadResult.success || !uploadResult.blob) {
      throw new Error(`Failed to upload video: ${uploadResult.error}`);
    }

    // Get video dimensions
    const dimensions = await getVideoDimensions(videoUri);

    return {
      success: true,
      blob: uploadResult.blob,
      aspectRatio: dimensions
        ? {
            width: dimensions.width,
            height: dimensions.height,
          }
        : undefined,
    };
  } catch (error: unknown) {
    logger.error("uploadVideo failed", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
/**
 * Get image dimensions from URI
 * First tries to use Expo's Image.getSize, then falls back to React Native's Image.getSize
 */
export async function getImageDimensions(uri: string): Promise<{
  width: number;
  height: number;
} | null> {
  try {
    // Normalize the URI for different platforms and URI types
    const fileUri = await normalizeFileUri(uri);

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error(`File not found at path: ${fileUri}`);
    }

    try {
      // Use the new ImageManipulator API
      const result = await ImageManipulator.manipulateAsync(
        fileUri,
        [{ resize: { width: 1, height: 1 } }], // Minimal resize to get dimensions
        { format: ImageManipulator.SaveFormat.PNG, compress: 0.1 }
      );

      if (result.width && result.height) {
        return { width: result.width, height: result.height };
      }
    } catch (manipulatorError) {
      // Fallback to React Native's Image.getSize
      logger.log("Falling back to Image.getSize", manipulatorError);
    }

    // Use React Native's Image.getSize as fallback
    const { Image } = await import("react-native");

    return new Promise((resolve) => {
      Image.getSize(
        uri,
        (width, height) => {
          resolve({ width, height });
        },
        () => {
          resolve(null);
        }
      );
    });
  } catch (error) {
    logger.error("getImageDimensions failed", error);
    return null;
  }
}

/**
 * Get video dimensions from URI using expo-video-thumbnails
 * Now with proper file system handling
 */
export async function getVideoDimensions(uri: string): Promise<{
  width: number;
  height: number;
} | null> {
  try {
    // Normalize the URI for different platforms and URI types
    const fileUri = await normalizeFileUri(uri);

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error(`Video file not found at path: ${fileUri}`);
    }

    // Generate thumbnail to get video dimensions
    const result = await getThumbnailAsync(fileUri, {
      time: 0, // Get thumbnail from the first frame
      quality: 0.1, // Low quality since we only need dimensions
    });

    if (result.width && result.height) {
      return { width: result.width, height: result.height };
    }

    return null;
  } catch (error) {
    logger.error("getVideoDimensions failed", error);
    return null;
  }
}
