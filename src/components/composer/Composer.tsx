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
}
const MAX_LEGHT = 300;

export const Composer: FunctionComponent<ComposerProps> = ({
  onClose,
  onPost,
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
            } catch (error) {
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
    return (
      text.length <= MAX_LEGHT &&
      ((images.map((img) => img.uri).length > 0 && !video) ||
        (video && images.map((img) => img.uri).length === 0) ||
        (images.map((img) => img.uri).length === 0 && !video))
    );
  }, [text, images, video]);

  const handlePost = async () => {
    if (!canPost) return;
    setIsPosting(true);
    try {
      await onPost({ text, images: images.map((img) => img.uri), video });
      setText("");
      setImages([]);
      setVideo(null);
      onClose();
    } catch (e) {
      Alert.alert("Error", "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

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
        <HStack className="p-3 items-start">
          <Avatar
            uri={user?.avatar}
            fallbackText={user?.displayName || user?.handle}
            size="medium"
          />
          <TextInput
            ref={inputRef}
            className="flex-1 ml-3 text-lg text-black min-h-[80px]"
            placeholder="What's on your mind?"
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
