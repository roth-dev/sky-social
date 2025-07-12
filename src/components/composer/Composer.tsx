import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  FunctionComponent,
} from "react";
import { TextInput, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Avatar } from "@/components/ui/Avatar";
import { HStack, Text, VStack } from "@/components/ui";
import { FileArchive } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { VideoCompressor } from "@/lib/videoCompressor";
import { ComposerToolbar } from "./ComposerToolbar";
import { ComposerImagePreview } from "./ComposerImagePreview";
import { ComposerVideoPreview } from "./ComposerVideoPreview";
import { ComposerAltModal } from "./ComposerAltModal";

interface ComposerProps {
  onClose: () => void;
  onPost: (data: {
    text: string;
    images: string[];
    video: string | null;
  }) => Promise<void>;
  replyTo?: {
    post: {
      uri: string;
      cid: string;
      author: {
        handle: string;
        displayName?: string;
      };
      record: {
        text: string;
      };
    };
  };
  onPostStateChange?: (state: { canPost: boolean; isPosting: boolean }) => void;
  onPostTrigger?: (triggerPost: () => void) => void;
}
const MAX_LEGHT = 300;

export const Composer: FunctionComponent<ComposerProps> = ({
  onClose,
  onPost,
  replyTo,
  onPostStateChange,
  onPostTrigger,
}) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [images, setImages] = useState<{ uri: string; alt?: string }[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isVideoCompressing, setIsVideoCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [isPosting, setIsPosting] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [altEditVisible, setAltEditVisible] = useState(false);
  const [altEditIndex, setAltEditIndex] = useState<number | null>(null);
  const [altEditValue, setAltEditValue] = useState("");
  const { colorScheme } = useSettings();

  const pickMedia = useCallback(
    async (fromCamera: boolean, type: "image" | "video") => {
      let result;
      if (fromCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: type === "image" ? "images" : "videos",
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: type === "image" ? "images" : "videos",
          allowsMultipleSelection: type === "image",
          selectionLimit: type === "image" ? 4 - images.length : 1,
          quality: 0.8,
          preferredAssetRepresentationMode:
            ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current,
        });
      }
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (type === "image") {
          if (video) return; // Don't allow images if video is selected
          const newImages = result.assets
            .slice(0, 4 - images.length)
            .map((asset) => ({ uri: asset.uri, alt: "" }));
          setImages((prev) => [...prev, ...newImages].slice(0, 4));
        } else {
          if (images.length > 0) return; // Don't allow video if images are selected
          const videoUri = result.assets[0].uri;

          setVideo(videoUri);
          setVideoThumbnail(videoUri);

          // Start video compression in background
          setIsVideoCompressing(true);
          setCompressionProgress(0);

          setTimeout(async () => {
            try {
              // Compress the video
              const compressedResult = await VideoCompressor.compressVideo(
                videoUri,
                (progress) => {
                  setCompressionProgress(progress.progress);
                }
              );

              setVideo(compressedResult.uri);
            } finally {
              setIsVideoCompressing(false);
              setCompressionProgress(0);
            }
          }, 1000);
        }
      }
    },
    [images, video]
  );

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  const handleEditAlt = (index: number) => {
    setAltEditIndex(index);
    setAltEditValue(images[index].alt || "");
    setAltEditVisible(true);
  };
  const handleSaveAlt = () => {
    if (altEditIndex !== null) {
      setImages((prev) =>
        prev.map((img, i) =>
          i === altEditIndex ? { ...img, alt: altEditValue } : img
        )
      );
    }
    setAltEditVisible(false);
    setAltEditIndex(null);
    setAltEditValue("");
  };
  const handleCancelAlt = () => {
    setAltEditVisible(false);
    setAltEditIndex(null);
    setAltEditValue("");
  };
  const handleRemoveVideo = () => {
    setVideo(null);
    setVideoThumbnail(null);
    setIsVideoCompressing(false);
    setCompressionProgress(0);
  };

  const canPost = useMemo(() => {
    const hasText = text.trim().length > 0;
    const hasMedia = images.length > 0 || !!video;
    const result =
      text.length <= MAX_LEGHT &&
      (hasText || hasMedia) &&
      ((images.map((img) => img.uri).length > 0 && !video) ||
        (video && images.map((img) => img.uri).length === 0) ||
        (images.map((img) => img.uri).length === 0 && !video));

    return result;
  }, [text, images, video]);

  // Notify parent component about posting state changes
  React.useEffect(() => {
    onPostStateChange?.({ canPost, isPosting });
  }, [canPost, isPosting, onPostStateChange]);

  // Use refs to store the latest onPost and onClose functions
  const onPostRef = React.useRef(onPost);
  const onCloseRef = React.useRef(onClose);

  // Update refs when props change
  React.useEffect(() => {
    onPostRef.current = onPost;
    onCloseRef.current = onClose;
  }, [onPost, onClose]);

  const handlePost = React.useCallback(async () => {
    if (!canPost) return;
    setIsPosting(true);
    try {
      await onPostRef.current({
        text,
        images: images.map((img) => img.uri),
        video,
      });
      setText("");
      setImages([]);
      setVideo(null);
      onCloseRef.current();
    } catch (e) {
      Alert.alert("Error", "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  }, [canPost, text, images, video]);

  // Expose handlePost function to parent component
  React.useEffect(() => {
    onPostTrigger?.(handlePost);
  }, [onPostTrigger, handlePost]);

  // Keep keyboard open by refocusing on blur
  const handleBlur = () => {
    setTimeout(() => {
      inputRef.current?.blur();
    }, 10);
  };

  return (
    <VStack
      className="flex-1 bg-white border-t"
      style={{ borderTopColor: Colors.border[colorScheme] }}
    >
      <ComposerAltModal
        visible={altEditVisible}
        value={altEditValue}
        onChange={setAltEditValue}
        onCancel={handleCancelAlt}
        onSave={handleSaveAlt}
      />
      {/* Avatar and input row */}
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Reply Preview */}
        {replyTo && (
          <VStack className="px-3 pt-3 pb-2 border-b border-gray-200">
            <Text size="sm" className="text-gray-500 mb-2">
              Replying to @{replyTo.post.author.handle}
            </Text>
            <VStack className="pl-3 border-l-2 border-gray-300">
              <HStack className="items-center mb-1">
                <Text size="sm" className="font-semibold text-black">
                  {replyTo.post.author.displayName ||
                    replyTo.post.author.handle}
                </Text>
                <Text size="sm" className="text-gray-500 ml-1">
                  @{replyTo.post.author.handle}
                </Text>
              </HStack>
              <Text size="sm" className="text-black" numberOfLines={2}>
                {replyTo.post.record.text}
              </Text>
            </VStack>
          </VStack>
        )}

        <HStack className="p-3 items-start">
          <Avatar
            uri={user?.avatar}
            fallbackText={user?.displayName || user?.handle}
            size="medium"
          />
          <TextInput
            ref={inputRef}
            className="flex-1 ml-3 text-lg text-black dark:text-white min-h-[80px]"
            placeholder={
              replyTo ? "Write your reply..." : "What's on your mind?"
            }
            placeholderTextColor="#888"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={MAX_LEGHT}
            onBlur={handleBlur}
            autoFocus
            underlineColorAndroid="transparent"
          />
        </HStack>
        <ComposerImagePreview
          images={images}
          onEditAlt={handleEditAlt}
          onRemoveImage={handleRemoveImage}
        />
        {/* Video Preview */}
        {video && (
          <ComposerVideoPreview
            videoUri={video}
            thumbnailUri={videoThumbnail || undefined}
            isCompressing={isVideoCompressing}
            compressionProgress={compressionProgress}
            onRemove={handleRemoveVideo}
          />
        )}
        {/* Alt text info row */}
        {images.length > 0 && (
          <HStack className="items-center px-4 mb-2">
            <FileArchive size={18} color="#9ca3af" className="mr-1.5" />
            <Text size="sm" className="text-gray-400">
              Alt text describes images for blind and low-vision users, and
              helps everyone understand your post.
            </Text>
          </HStack>
        )}
      </KeyboardAwareScrollView>
      <KeyboardToolbar
        showArrows={false}
        doneText={false}
        collapsableChildren
        content={
          <ComposerToolbar
            text={text}
            maxLength={MAX_LEGHT}
            images={images}
            video={video}
            isPosting={isPosting}
            canPost={canPost}
            onPost={handlePost}
            onPickMedia={pickMedia}
          />
        }
      />
    </VStack>
  );
};
