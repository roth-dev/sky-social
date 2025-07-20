import React, { useCallback } from "react";
import { View, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { ATPost } from "@/types/atproto";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Formater } from "@/lib/format";
import { HapticTab } from "@/components/ui/HapticTab";
import { HStack, Text, VStack } from "../ui";

interface VideoFeedOverlayProps {
  post: ATPost;
  onLike: () => void;
  onRepost: () => void;
  onShare: () => void;
  onUserPress: () => void;
}

export function VideoFeedOverlay({
  post,
  onLike,
  onRepost,
  onShare,
  onUserPress,
}: VideoFeedOverlayProps) {
  const { isAuthenticated } = useAuth();
  const isLiked = !!post.viewer?.like;
  const isReposted = !!post.viewer?.repost;
  const bottom = useBottomTabBarHeight();

  const handleComment = useCallback(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // Open composer modal with reply data
    const replyData = encodeURIComponent(JSON.stringify(post));
    router.push(
      `/(modal)/composer?replyTo=${replyData}&parentUri=${encodeURIComponent(
        post.uri
      )}&parentCid=${encodeURIComponent(post.cid)}&rootUri=${encodeURIComponent(
        post.uri
      )}&rootCid=${encodeURIComponent(post.cid)}`
    );
  }, [isAuthenticated, post]);

  return (
    <View style={[styles.overlay, { bottom }]}>
      {/* Bottom Gradient */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.bottomGradient}
      />

      {/* Right Side Actions */}
      <View className="gap-2 absolute right-2 bottom-10">
        <VStack className="items-center" darkColor="none">
          <HapticTab
            leftIcon={Heart}
            leftIconSize={32}
            leftIconColor={isLiked ? "#ff3040" : "#ffffff"}
            leftIconFill={isLiked ? "#ff3040" : "none"}
            leftIconStrokeWidth={2}
            onPress={onLike}
            hapticType="success"
            variant="ghost"
            className="dark:hover:bg-transparent"
          />
          <Text
            font="semiBold"
            className="text-white text-shadow-md shadow-black"
          >
            {Formater.formatNumberToKOrM(post.likeCount || 0)}
          </Text>
        </VStack>

        {/* Comment Button */}
        <VStack darkColor="none" className="items-center">
          <HapticTab
            leftIcon={MessageCircle}
            leftIconSize={32}
            leftIconColor="#ffffff"
            leftIconStrokeWidth={2}
            onPress={handleComment}
            hapticType="light"
            variant="ghost"
            className="dark:hover:bg-transparent"
          />
          <Text
            font="semiBold"
            className="text-white text-shadow-md shadow-black"
          >
            {Formater.formatNumberToKOrM(post.replyCount || 0)}
          </Text>
        </VStack>

        {/* Repost Button */}
        <VStack darkColor="none" className="items-center">
          <HapticTab
            leftIcon={Repeat2}
            leftIconSize={32}
            leftIconColor={isReposted ? "#00ba7c" : "#ffffff"}
            leftIconFill={isReposted ? "#00ba7c" : "none"}
            leftIconStrokeWidth={2}
            onPress={onRepost}
            hapticType="medium"
            variant="ghost"
            className="dark:hover:bg-transparent"
          />
          <Text
            font="semiBold"
            className="text-white text-shadow-md shadow-black"
          >
            {Formater.formatNumberToKOrM(post.repostCount || 0)}
          </Text>
        </VStack>

        {/* Share Button */}
        <HapticTab
          leftIcon={Share}
          leftIconSize={32}
          leftIconColor="#ffffff"
          leftIconStrokeWidth={2}
          onPress={onShare}
          hapticType="light"
          variant="ghost"
          size="lg"
          className="dark:hover:bg-transparent"
        />
      </View>

      <VStack
        darkColor="none"
        className="absolute bottom-4 left-2 gap-2 max-w-[80%]"
      >
        <HStack darkColor="none">
          <TouchableOpacity onPress={onUserPress}>
            <Avatar
              uri={post.author.avatar}
              fallbackText={post.author.displayName || post.author.handle}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <Pressable className="max-w-[80%]" onPress={onUserPress}>
            <Text
              font="semiBold"
              className="text-shadow-md shadow-black text-white"
            >
              @{post.author.handle}
            </Text>
            {post.author.displayName && (
              <Text
                size="sm"
                className="text-shadow-md shadow-black text-gray-300 dark:text-gray-300"
              >
                {post.author.displayName}
              </Text>
            )}
          </Pressable>
        </HStack>

        {post.record.text && (
          <Text
            className="text-shadow-md shadow-black text-white"
            numberOfLines={3}
          >
            {post.record.text}
          </Text>
        )}
      </VStack>
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
  avatar: {
    borderWidth: 2,
    borderColor: "#ffffff",
  },
});
