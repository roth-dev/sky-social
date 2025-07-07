import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { ATPost } from "@/types/atproto";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

interface VideoFeedOverlayProps {
  post: ATPost;
  onLike: () => void;
  onRepost: () => void;
  onComment: () => void;
  onShare: () => void;
  onUserPress: () => void;
}

export function VideoFeedOverlay({
  post,
  onLike,
  onRepost,
  onComment,
  onShare,
  onUserPress,
}: VideoFeedOverlayProps) {
  const isLiked = !!post.viewer?.like;
  const isReposted = !!post.viewer?.repost;
  const bottom = useBottomTabBarHeight();

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <View style={[styles.overlay, { bottom }]}>
      {/* Bottom Gradient */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.bottomGradient}
      />

      {/* Right Side Actions */}
      <View style={styles.rightActions}>
        {/* User Avatar with Follow Button */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={onUserPress}>
            <Avatar
              uri={post.author.avatar}
              fallbackText={post.author.displayName || post.author.handle}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Like Button */}
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionButton} onPress={onLike}>
            <Heart
              size={32}
              color={isLiked ? "#ff3040" : "#ffffff"}
              fill={isLiked ? "#ff3040" : "none"}
              strokeWidth={2}
            />
          </TouchableOpacity>
          <Text style={styles.actionCount}>
            {formatCount(post.likeCount || 0)}
          </Text>
        </View>

        {/* Comment Button */}
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionButton} onPress={onComment}>
            <MessageCircle size={32} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.actionCount}>
            {formatCount(post.replyCount || 0)}
          </Text>
        </View>

        {/* Repost Button */}
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionButton} onPress={onRepost}>
            <Repeat2
              size={32}
              color={isReposted ? "#00ba7c" : "#ffffff"}
              strokeWidth={2}
            />
          </TouchableOpacity>
          <Text style={styles.actionCount}>
            {formatCount(post.repostCount || 0)}
          </Text>
        </View>

        {/* Share Button */}
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Share size={32} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Content */}
      <View style={styles.bottomContent}>
        {/* User Info */}
        <TouchableOpacity style={styles.userInfo} onPress={onUserPress}>
          <Text style={styles.username}>@{post.author.handle}</Text>
          {post.author.displayName && (
            <Text style={styles.displayName}>{post.author.displayName}</Text>
          )}
        </TouchableOpacity>

        {/* Post Text */}
        {post.record.text && (
          <Text style={styles.description} numberOfLines={3}>
            {post.record.text}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  rightActions: {
    position: "absolute",
    right: 12,
    bottom: 100,
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  followButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ff3040",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -12,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  actionItem: {
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCount: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  musicButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  bottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 80,
    padding: 16,
    gap: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  username: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  displayName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  musicInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  musicText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "500",
    opacity: 0.9,
    flex: 1,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
