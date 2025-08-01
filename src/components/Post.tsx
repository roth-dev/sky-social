import React, { memo, useCallback, useMemo, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { MoreHorizontal } from "lucide-react-native";
import { Avatar } from "./ui/Avatar";
import { EmbedContainer } from "./embeds/EmbedContainer";
import { ATPost } from "@/types/atproto";
import { router } from "expo-router";
import { Platform, Linking } from "react-native";
import { isVideoPost } from "@/utils/embedUtils";
import { RichText, Text } from "./ui";
import { Colors } from "@/constants/colors";
import { VideoEmbed } from "./embeds/VideoEmbed";
import { RichText as RichTextAPI } from "@atproto/api";
import { POST_PRIFIX } from "@/constants";
import { Formater } from "@/lib/format";
import { LightBox } from "./lightBox";
import { ActionButtons } from "./ActionButtons";
import { useSettings } from "@/contexts/SettingsContext";
import { DropDownMenu, Trigger } from "./dropdown";
import { Globe, Copy } from "lucide-react-native";
import { DropDownMenuAction } from "./dropdown/type";
import { t } from "@lingui/core/macro";

interface PostProps {
  post: ATPost;
  isFocused?: boolean;
  onLike?: (uri: string, cid: string) => void;
  onRepost?: (uri: string, cid: string) => void;
  onComment?: (uri: string) => void;
  isDetailView?: boolean;
  isReply?: boolean;
  shouldPlay?: boolean;
}

function Stats({ count, label }: { count: number; label: string }) {
  return (
    <View className="items-center">
      <Text font="semiBold" size="lg">
        {Formater.formatNumberToKOrM(count)}
      </Text>
      <Text>{label}</Text>
    </View>
  );
}

const Post = memo(function Comp({
  post,
  onLike,
  onRepost,
  onComment,
  isDetailView = false,
  isReply = false,
  shouldPlay = false,
}: PostProps) {
  const { colorScheme } = useSettings();
  const [lightBoxVisible, setLightBoxVisible] = useState(false);
  const [lightBoxIndex, setLightBoxIndex] = useState(0);
  const hasVideo = isVideoPost(post);

  const handlePostPress = useCallback(() => {
    if (!isDetailView) {
      const safeUri = post.uri.startsWith(POST_PRIFIX)
        ? post.uri.slice(POST_PRIFIX.length)
        : post.uri;
      const formatedUri = encodeURIComponent(safeUri);
      router.push(`/profile/${post.author.handle}/post/${formatedUri}`);
    }
  }, [isDetailView, post]);

  const handleProfilePress = useCallback(() => {
    router.push(`/profile/${post.author.handle}`);
  }, [post]);

  const handleImagePress = useCallback((images: unknown, index: number) => {
    setLightBoxIndex(index);
    setLightBoxVisible(true);
  }, []);

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ["http:", "https:"].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  const handleRecordPress = useCallback((uri: string) => {
    const safeUri = encodeURIComponent(uri);
    router.push(`/profile/post/${safeUri}`);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      if (
        Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(text);
        Alert.alert(t`Copied`, t`URL copied to clipboard`);
      } else {
        // Fallback for environments without clipboard API
        Alert.alert(t`URL`, text);
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      Alert.alert(t`URL`, text);
    }
  }, []);

  const handleImageShare = useCallback(
    async (imageUri: string) => {
      try {
        if (Platform.OS === "web") {
          if (navigator.share) {
            await navigator.share({
              title: `Image from @${post.author.handle}`,
              text: post.record.text,
              url: imageUri,
            });
          } else {
            await copyToClipboard(imageUri);
          }
        }
      } catch (error) {
        console.error("Failed to share image:", error);
      }
    },
    [post, copyToClipboard]
  );

  const handleImageDownload = async (imageUri: string, index: number) => {
    try {
      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = imageUri;
        link.download = `image-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const formatTime = useCallback(
    (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (isDetailView) {
        return date.toLocaleDateString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      if (diffInHours < 1) return t`now`;
      if (diffInHours < 24) return t`${diffInHours}h`;
      return t`${Math.floor(diffInHours / 24)}d`;
    },
    [isDetailView]
  );

  // Prepare images for LightBox from embed
  const lightBoxImages = useMemo(() => {
    const embedImages = post.embed?.images || [];

    return embedImages.map((img) => ({
      uri: img.fullsize,
      alt: img.alt || `Image from @${post.author.handle}`,
      aspectRatio: img.aspectRatio,
    }));
  }, [post.embed, post.author]);

  // Action menu handlers
  const handleTranslate = () => {
    Alert.alert(t`Translate`, t`Translate action triggered (implement logic)`);
  };

  const handleCopyPostText = useCallback(() => {
    copyToClipboard(post.record.text);
  }, [copyToClipboard, post]);

  const handleLinkPress = useCallback(
    async (url: string) => {
      try {
        // Validate URL format
        if (!isValidUrl(url)) {
          Alert.alert(
            t`Invalid URL`,
            t`This link appears to be invalid or malformed.`
          );
          return;
        }

        // Check if the URL can be opened
        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert(
            t`Cannot Open Link`,
            t`This link cannot be opened on your device. Would you like to copy the URL?`,
            [
              { text: t`Copy URL`, onPress: () => copyToClipboard(url) },
              { text: t`Cancel`, style: "cancel" },
            ]
          );
        }
      } catch (error) {
        console.error("Failed to open URL:", error);
        Alert.alert(
          t`Link Error`,
          t`Unable to open this link. Would you like to copy the URL instead?`,
          [
            { text: t`Copy URL`, onPress: () => copyToClipboard(url) },
            { text: t`Cancel`, style: "cancel" },
          ]
        );
      }
    },
    [copyToClipboard]
  );

  const postMenuActions: DropDownMenuAction[] = useMemo(
    () => [
      {
        label: t`Translate`,
        onPress: handleTranslate,
        web: {
          icon: <Globe size={16} />,
        },
      },
      {
        label: t`Copy post text`,
        onPress: handleCopyPostText,
        web: {
          icon: <Copy size={16} />,
        },
      },
    ],
    [handleCopyPostText]
  );

  const renderProfile = useCallback(
    () => (
      <Pressable onPress={handleProfilePress}>
        <Avatar
          border
          size={isDetailView ? "large" : "medium"}
          uri={post.author.avatar}
          fallbackText={post.author.displayName || post.author.handle}
        />
      </Pressable>
    ),
    [post, handleProfilePress, isDetailView]
  );

  return (
    <>
      {lightBoxImages.length > 0 && (
        <LightBox
          visible={lightBoxVisible}
          images={lightBoxImages}
          initialIndex={lightBoxIndex}
          onClose={() => {
            setLightBoxVisible(false);
          }}
          onShare={handleImageShare}
          onDownload={handleImageDownload}
        />
      )}
      <TouchableOpacity
        onPress={handlePostPress}
        activeOpacity={isDetailView ? 1 : 0.95}
        disabled={isDetailView}
        delayPressIn={200}
        pressRetentionOffset={{ top: 20, left: 20, right: 20, bottom: 20 }}
        hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          padding: 15,
          gap: 10,
          flex: 1,
          borderBottomColor: Colors.border[colorScheme],
          borderBottomWidth: 1,
        }}
      >
        {!isDetailView && renderProfile()}

        <View style={{ flex: 1 }}>
          {
            // Post header content
          }
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            {isDetailView && renderProfile()}

            <Pressable
              onPress={handleProfilePress}
              style={{ flexDirection: "row" }}
            >
              <View
                style={{
                  flexDirection: isDetailView ? "column" : "row",
                  flexWrap: "wrap",
                }}
              >
                <Text
                  font="semiBold"
                  numberOfLines={1}
                  size="lg"
                  style={{ marginRight: 5 }}
                >
                  {post.author.displayName || post.author.handle}
                </Text>
                <Text
                  className="text-gray-700 dark:text-gray-300"
                  style={{ marginRight: 5 }}
                >
                  @{post.author.handle}
                </Text>
                {!isDetailView && (
                  <>
                    <Text style={{ marginRight: 5 }}>·</Text>
                    <Text>{formatTime(post.record.createdAt)}</Text>
                  </>
                )}

                {!!isDetailView && (
                  <Text size="sm">{formatTime(post.record.createdAt)}</Text>
                )}
              </View>
              {
                // Action menu button
              }
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable
              style={{
                height: 20,
              }}
            >
              <DropDownMenu actions={postMenuActions}>
                <Trigger
                  shape="round"
                  size="icon"
                  className="py-0 web:p-1"
                  variant="ghost"
                >
                  <MoreHorizontal size={20} color="#6b7280" />
                </Trigger>
              </DropDownMenu>
            </Pressable>
          </View>

          {
            // Post content
          }

          {/* Embed Content - This will now properly handle videos */}
          <View style={{ flex: 1 }}>
            {!!post.record.text && (
              <RichText
                value={
                  post.record.facets
                    ? new RichTextAPI({
                        text: post.record.text,
                        facets: post.record.facets,
                      })
                    : post.record.text
                }
                size={isDetailView ? "xl" : "lg"}
                disableLinks={false}
                enableTags={true}
                onLinkPress={handleLinkPress}
              />
            )}

            {!!post.embed && (
              <EmbedContainer
                embed={post.embed}
                isDetailView={isDetailView}
                onImagePress={handleImagePress}
                onLinkPress={handleLinkPress}
                onRecordPress={handleRecordPress}
                shouldPlay={shouldPlay}
              />
            )}

            {/* Video indicator for debugging */}
            {!!hasVideo && post.embed && (
              <VideoEmbed
                isDetailView={isDetailView}
                video={post.embed}
                shouldPlay={shouldPlay}
              />
            )}
            {isDetailView && (
              <View
                style={styles.detailStats}
                className="border-gray-300 dark:border-gray-700"
              >
                <Stats count={post.replyCount} label="Replies" />
                <Stats count={post.repostCount} label="Reposts" />
                <Stats count={post.likeCount} label="Likes" />
              </View>
            )}
            {
              // Action buttons
            }
            <ActionButtons
              post={post}
              isDetailView={isDetailView}
              onLike={onLike}
              onRepost={onRepost}
              onComment={onComment}
            />
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
});

Post.displayName = "Post";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailStats: {
    flexDirection: "row",
    gap: 24,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
  },
});
export { Post };
