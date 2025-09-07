import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { TextInput, Modal } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Avatar } from "@/components/ui/Avatar";
import { Button, HStack, Text, VStack, Dialog } from "@/components/ui";
import { FileArchive } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import {
  KeyboardAwareScrollView,
  KeyboardProvider,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { VideoCompressor } from "@/lib/videoCompressor";
import { ComposerToolbar } from "./ComposerToolbar";
import { ComposerImagePreview } from "./ComposerImagePreview";
import { ComposerVideoPreview } from "./ComposerVideoPreview";
import { ComposerAltModal } from "./ComposerAltModal";
import { UploadProgress } from "./UploadProgress";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Header } from "../Header";
import { isWeb } from "@/platform";
import ComposerContainer from "./ComposerContainer";
import { useCreatePost, useCreateReply } from "@/hooks/mutation";

export type CompopserRef = {
  open: () => void;
  close: () => void;
};
interface ComposerProps {
  onClose: () => void;
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
}
const MAX_LEGHT = 300;

export const Composer = forwardRef<CompopserRef, ComposerProps>(
  ({ onClose, replyTo, onPostStateChange }, ref) => {
    const { user } = useAuth();
    const [text, setText] = useState("");
    const [images, setImages] = useState<{ uri: string; alt?: string }[]>([]);
    const [video, setVideo] = useState<string | null>(null);
    const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
    const [isVideoCompressing, setIsVideoCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [isPosting, setIsPosting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const inputRef = useRef<TextInput>(null);
    const [altEditVisible, setAltEditVisible] = useState(false);
    const [altEditIndex, setAltEditIndex] = useState<number | null>(null);
    const [altEditValue, setAltEditValue] = useState("");
    const { colorScheme } = useSettings();

    const [visible, setVisble] = useState(false);
    const createPostMutation = useCreatePost();
    const createReplyMutation = useCreateReply();

    const isReply = !!replyTo?.post;

    useImperativeHandle(ref, () => ({
      open: () => {
        setVisble(true);
      },
      close: () => {
        setVisble(false);
      },
    }));

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
            presentationStyle:
              ImagePicker.UIImagePickerPresentationStyle.OVER_FULL_SCREEN,
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
    // const onPostRef = React.useRef(onPost);
    const onCloseRef = React.useRef(onClose);

    // Update refs when props change
    React.useEffect(() => {
      // onPostRef.current = onPost;
      onCloseRef.current = onClose;
    }, [onClose]);

    const handlePost = useCallback(async () => {
      if (!canPost || isPosting) return;

      setIsPosting(true);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        if (isReply && replyTo) {
          // Create reply
          await createReplyMutation.mutateAsync({
            text,
            parentUri: replyTo.post.uri,
            parentCid: replyTo.post.cid,
            rootUri: replyTo.post.uri,
            rootCid: replyTo.post.cid,
          });
        } else {
          // Show upload progress for media
          if (images.length > 0 || video) {
            setUploadProgress(25);
          }

          // Create new post
          await createPostMutation.mutateAsync({
            text,
            images: images,
            video: video || undefined,
          });

          setUploadProgress(100);
        }

        // Reset form
        setText("");
        setImages([]);
        setVideo(null);
        setVideoThumbnail(null);

        // Close modal after successful posting
        setVisble(false);
        onCloseRef.current();
      } catch (error) {
        console.error("Post creation error:", error);
        Dialog.show(
          "Error",
          isReply ? "Failed to post reply" : "Failed to create post"
        );
      } finally {
        setIsPosting(false);
        setIsUploading(false);
        setUploadProgress(0);
      }
    }, [
      canPost,
      isPosting,
      text,
      images,
      video,
      isReply,
      replyTo,
      createReplyMutation,
      createPostMutation,
    ]);

    // Keep keyboard open by refocusing on blur
    const handleBlur = () => {
      setTimeout(() => {
        inputRef.current?.blur();
      }, 10);
    };

    let composerContent = (
      <VStack
        className="flex-1 border-t"
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
                <Trans>Replying to @{replyTo.post.author.handle}</Trans>
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
              className="flex-1 ml-3 text-lg text-black dark:text-white min-h-[80px] font-normal"
              placeholder={
                replyTo ? t`Write your reply...` : t`What's on your mind?`
              }
              placeholderTextColor="#888"
              textAlignVertical="top"
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
          {/* Upload Progress */}
          {isUploading && (
            <UploadProgress
              isUploading={isUploading}
              progress={uploadProgress}
              uploadType={video ? "video" : "image"}
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

    return (
      <Modal
        animationType={isWeb ? "none" : "slide"}
        presentationStyle={isWeb ? "fullScreen" : "formSheet"}
        transparent={isWeb}
        // backdropColor="rgba(0,0,0,0.5)"
        aria-modal
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        pointerEvents="box-none"
        visible={visible}
        onRequestClose={() => {
          setVisble(false);
        }}
      >
        <ComposerContainer>
          <Header
            renderLeft={() => {
              return (
                <Button
                  onPress={() => setVisble(false)}
                  title="Cancel"
                  font="semiBold"
                  variant="ghost"
                />
              );
            }}
            renderRight={() => (
              <Button
                onPress={handlePost}
                font="semiBold"
                title="Post"
                shape="round"
                disabled={!canPost || isPosting}
              />
            )}
            disableSafeArea
            title={replyTo ? "Reply" : "New Post"}
          />
          <KeyboardProvider>{composerContent}</KeyboardProvider>
        </ComposerContainer>
      </Modal>
    );
  }
);

Composer.displayName = "Composer";
