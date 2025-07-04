import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoveHorizontal as MoreHorizontal,
} from "lucide-react-native";
import { Avatar } from "./ui/Avatar";
import { LightBox } from "./ui/LightBox";
import { EmbedContainer } from "./embeds/EmbedContainer";
import { ATPost } from "@/types/atproto";
import { router } from "expo-router";
import { Platform, Linking } from "react-native";
import { isVideoPost } from "@/utils/embedUtils";
// import { VideoFeed } from "./video/VideoFeed";
// import { VideoPlayer } from "./video/VideoPlayer";
// import { VideoEmbed } from "./embeds/VideoEmbed";
import { Text } from "./ui";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { VideoEmbed } from "./embeds/VideoEmbed";

interface PostProps {
  post: ATPost;
  onLike?: (uri: string, cid: string) => void;
  onRepost?: (uri: string, cid: string) => void;
  onComment?: (uri: string) => void;
  isDetailView?: boolean;
  isReply?: boolean;
}

function Post({
  post,
  onLike,
  onRepost,
  onComment,
  isDetailView = false,
  isReply = false,
}: PostProps) {
  const { isDarkMode } = useSettings();
  const [lightBoxVisible, setLightBoxVisible] = useState(false);
  const [lightBoxIndex, setLightBoxIndex] = useState(0);

  const isLiked = !!post.viewer?.like;
  const isReposted = !!post.viewer?.repost;
  const hasVideo = isVideoPost(post);

  const handleLike = () => {
    onLike?.(post.uri, post.cid);
  };

  const handleRepost = () => {
    onRepost?.(post.uri, post.cid);
  };

  const handleComment = () => {
    if (isDetailView) {
      onComment?.(post.uri);
    } else {
      const safeUri = encodeURIComponent(post.uri);
      router.push(`/post/${safeUri}`);
    }
  };

  const handlePostPress = () => {
    if (!isDetailView) {
      const safeUri = encodeURIComponent(post.uri);
      router.push(`/post/${safeUri}`);
    }
  };

  const handleProfilePress = () => {
    router.push(`/profile/${post.author.handle}`);
  };

  const handleImagePress = (images: any[], index: number) => {
    setLightBoxIndex(index);
    setLightBoxVisible(true);
  };

  const handleLinkPress = async (url: string) => {
    try {
      // Validate URL format
      if (!isValidUrl(url)) {
        Alert.alert(
          "Invalid URL",
          "This link appears to be invalid or malformed."
        );
        return;
      }

      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Cannot Open Link",
          "This link cannot be opened on your device. Would you like to copy the URL?",
          [
            { text: "Copy URL", onPress: () => copyToClipboard(url) },
            { text: "Cancel", style: "cancel" },
          ]
        );
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
      Alert.alert(
        "Link Error",
        "Unable to open this link. Would you like to copy the URL instead?",
        [
          { text: "Copy URL", onPress: () => copyToClipboard(url) },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (
        Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(text);
        Alert.alert("Copied", "URL copied to clipboard");
      } else {
        // Fallback for environments without clipboard API
        Alert.alert("URL", text);
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      Alert.alert("URL", text);
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ["http:", "https:"].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  const handleRecordPress = (uri: string) => {
    const safeUri = encodeURIComponent(uri);
    router.push(`/post/${safeUri}`);
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://bsky.app/profile/${
        post.author.handle
      }/post/${post.uri.split("/").pop()}`;

      if (Platform.OS === "web") {
        if (navigator.share) {
          await navigator.share({
            title: `Post by @${post.author.handle}`,
            text: post.record.text,
            url: shareUrl,
          });
        } else {
          await copyToClipboard(shareUrl);
        }
      }
    } catch (error) {
      console.error("Failed to share post:", error);
      Alert.alert("Share Error", "Unable to share this post.");
    }
  };

  const handleImageShare = async (imageUri: string, index: number) => {
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
  };

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

      if (diffInHours < 1) return "now";
      if (diffInHours < 24) return `${diffInHours}h`;
      return `${Math.floor(diffInHours / 24)}d`;
    },
    [isDetailView]
  );

  const textStyle = isDetailView ? styles.detailText : styles.text;
  const containerStyle = isReply
    ? [styles.container, styles.replyContainer]
    : styles.container;

  // Prepare images for LightBox from embed
  const lightBoxImages = useMemo(() => {
    const embedImages = post.embed?.images || [];

    return embedImages.map((img) => ({
      uri: img.fullsize,
      alt: img.alt || `Image from @${post.author.handle}`,
      aspectRatio: img.aspectRatio,
    }));
  }, [post.embed]);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <TouchableOpacity
        style={[containerStyle]}
        onPress={handlePostPress}
        activeOpacity={isDetailView ? 1 : 0.95}
        disabled={isDetailView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleProfilePress}>
            <Avatar
              uri={post.author.avatar}
              size={isDetailView ? "large" : "medium"}
              fallbackText={post.author.displayName || post.author.handle}
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <TouchableOpacity onPress={handleProfilePress}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName} numberOfLines={1}>
                  {post.author.displayName || post.author.handle}
                </Text>
                <Text style={styles.handle}>@{post.author.handle}</Text>
                {!isDetailView && (
                  <>
                    <Text style={styles.time}>·</Text>
                    <Text style={styles.time}>
                      {formatTime(post.record.createdAt)}
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {!!isDetailView && (
              <Text style={styles.detailTime}>
                {formatTime(post.record.createdAt)}
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={[styles.content, isDetailView && styles.detailContent]}>
          {!!post.record.text && (
            <Text style={textStyle}>{post.record.text}</Text>
          )}

          {/* Embed Content - This will now properly handle videos */}
          {!!post.embed && (
            <EmbedContainer
              embed={post.embed}
              isDetailView={isDetailView}
              onImagePress={handleImagePress}
              onLinkPress={handleLinkPress}
              onRecordPress={handleRecordPress}
            />
          )}

          {/* Video indicator for debugging */}
          {!!hasVideo && (
            <VideoEmbed isDetailView={isDetailView} video={post.embed} />
          )}
        </View>

        {isDetailView && (
          <View style={styles.detailStats}>
            <View style={styles.statGroup}>
              <Text style={styles.statNumber}>{post.replyCount}</Text>
              <Text style={styles.statLabel}>Replies</Text>
            </View>
            <View style={styles.statGroup}>
              <Text style={styles.statNumber}>{post.repostCount}</Text>
              <Text style={styles.statLabel}>Reposts</Text>
            </View>
            <View style={styles.statGroup}>
              <Text style={styles.statNumber}>{post.likeCount}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>
        )}

        <View style={[styles.actions, isDetailView && styles.detailActions]}>
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <MessageCircle size={isDetailView ? 22 : 20} color="#6b7280" />
            {!isDetailView && post.replyCount > 0 && (
              <Text style={styles.actionCount}>{post.replyCount}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleRepost}>
            <Repeat2
              size={isDetailView ? 22 : 20}
              color={isReposted ? "#10b981" : "#6b7280"}
            />
            {!isDetailView && post.repostCount > 0 && (
              <Text
                style={[styles.actionCount, isReposted && styles.repostedCount]}
              >
                {post.repostCount}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Heart
              size={isDetailView ? 22 : 20}
              color={isLiked ? "#ef4444" : "#6b7280"}
              fill={isLiked ? "#ef4444" : "none"}
            />
            {!isDetailView && post.likeCount > 0 && (
              <Text style={[styles.actionCount, isLiked && styles.likedCount]}>
                {post.likeCount}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share size={isDetailView ? 22 : 20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* LightBox Modal */}
      <LightBox
        visible={lightBoxVisible}
        images={lightBoxImages}
        initialIndex={lightBoxIndex}
        onClose={() => setLightBoxVisible(false)}
        onShare={handleImageShare}
        onDownload={handleImageDownload}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.dark,
  },
  replyContainer: {
    paddingLeft: 32,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  displayName: {
    fontSize: 15,
    fontWeight: "600",
    // color: "#111827",
    maxWidth: 120,
  },
  handle: {
    fontSize: 15,
    // color: "#6b7280",
    marginLeft: 4,
  },
  time: {
    fontSize: 15,
    // color: "#6b7280",
    marginLeft: 4,
  },
  detailTime: {
    fontSize: 14,
    // color: "#6b7280",
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    marginLeft: 52,
  },
  detailContent: {
    marginLeft: 0,
    marginTop: 12,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
    // color: "#111827",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 18,
    lineHeight: 26,
    // color: "#111827",
    marginBottom: 16,
  },
  debugIndicator: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  debugText: {
    fontSize: 12,
    // color: "#92400e",
    fontWeight: "500",
  },
  detailStats: {
    flexDirection: "row",
    gap: 24,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    marginTop: 16,
  },
  statGroup: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    // color: "#6b7280",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginLeft: 52,
    paddingRight: 40,
  },
  detailActions: {
    marginLeft: 0,
    paddingRight: 0,
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    marginTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginLeft: -8,
  },
  actionCount: {
    fontSize: 13,
    // color: "#6b7280",
    marginLeft: 6,
  },
  likedCount: {
    color: "#ef4444",
  },
  repostedCount: {
    color: "#10b981",
  },
});

const MemoizedPost = React.memo(Post);
export { MemoizedPost as Post };
