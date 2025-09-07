import React, { memo, useCallback } from "react";
import { View, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { MoreHorizontal } from "lucide-react-native";
import { Avatar } from "./ui/Avatar";
import { EmbedContainer } from "./embeds/EmbedContainer";
import { ATPost } from "@/types/atproto";
import { router } from "expo-router";
import { Platform, Linking } from "react-native";
import { RichText, Text, Dialog } from "./ui";
import { Colors } from "@/constants/colors";
import { RichText as RichTextAPI } from "@atproto/api";
import { POST_PRIFIX } from "@/constants";
import { Formater } from "@/lib/format";
import { ActionButtons } from "./ActionButtons";
import { useSettings } from "@/contexts/SettingsContext";
import { DropDownMenu, Trigger } from "./dropdown";
import { t } from "@lingui/core/macro";
import { usePostMenuActions } from "./PostMenu";

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
  isReply = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  shouldPlay = false,
}: PostProps) {
  const { colorScheme } = useSettings();

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      if (
        Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(text);
        Dialog.show(t`Copied`, t`URL copied to clipboard`);
      } else {
        // Fallback for environments without clipboard API
        Dialog.show(t`URL`, text);
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      Dialog.show(t`URL`, text);
    }
  }, []);

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

  // Get menu actions from hook
  const {
    postMenuActions,
    showTranslation,
    translationResult,
    toggleTranslation,
  } = usePostMenuActions({
    post,
    onCopyToClipboard: copyToClipboard,
  });

  const handleLinkPress = useCallback(async (url: string) => {
    try {
      // Validate URL format
      if (!isValidUrl(url)) {
        Dialog.show(
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
        Dialog.show(
          t`Cannot Open Link`,
          t`This link cannot be opened on your device. Would you like to copy the URL?`,
          [
            {
              text: t`Copy URL`,
              onPress: () => {
                // Note: We'll need to access copyToClipboard from the hook
                // For now, let's use a basic fallback
                Dialog.show(t`URL`, url);
              },
            },
            { text: t`Cancel`, style: "cancel" },
          ]
        );
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
      Dialog.show(
        t`Link Error`,
        t`Unable to open this link. Would you like to copy the URL instead?`,
        [
          {
            text: t`Copy URL`,
            onPress: () => {
              // Note: We'll need to access copyToClipboard from the hook
              // For now, let's use a basic fallback
              Dialog.show(t`URL`, url);
            },
          },
          { text: t`Cancel`, style: "cancel" },
        ]
      );
    }
  }, []);

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
              <View>
                <RichText
                  value={
                    showTranslation && translationResult?.translatedText
                      ? translationResult.translatedText
                      : post.record.facets
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

                {/* Translation controls */}
                {translationResult && (
                  <View style={{ marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={toggleTranslation}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        size="sm"
                        style={{
                          color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
                          textDecorationLine: "underline",
                        }}
                      >
                        {showTranslation
                          ? t`Show original`
                          : t`Show translation`}
                      </Text>
                      {translationResult.sourceLanguage && (
                        <Text
                          size="sm"
                          style={{
                            color:
                              colorScheme === "dark" ? "#9ca3af" : "#6b7280",
                            marginLeft: 8,
                          }}
                        >
                          ({translationResult.sourceLanguage} →{" "}
                          {translationResult.targetLanguage})
                        </Text>
                      )}
                    </TouchableOpacity>

                    {showTranslation && (
                      <Text
                        size="xs"
                        style={{
                          color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
                          marginTop: 4,
                          fontStyle: "italic",
                        }}
                      >
                        {t`Translated by Google Translate`}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {!!post.embed && (
              <EmbedContainer
                embed={post.embed}
                isDetailView={isDetailView}
                onLinkPress={handleLinkPress}
                onRecordPress={handleRecordPress}
                shouldPlay={shouldPlay}
              />
            )}

            {/* Video indicator for debugging */}
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
