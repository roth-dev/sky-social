import React, { useCallback, useRef, useState } from "react";
import { HapticTab } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import {
  useLikePost,
  useUnlikePost,
  useRepost,
  useDeleteRepost,
} from "@/hooks/mutation";
import { ATPost } from "@/types/atproto";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react-native";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Composer, type CompopserRef } from "./composer/Composer";

interface ActionButtonsProps {
  post: ATPost;
  isDetailView?: boolean;
  onLike?: (uri: string, cid: string) => void;
  onRepost?: (uri: string, cid: string) => void;
  onComment?: (uri: string, cid: string) => void;
  onShare?: (uri: string, cid: string) => void;
}

export function ActionButtons({
  post,
  isDetailView = false,
  onLike,
  onRepost,
  onComment,
  onShare,
}: ActionButtonsProps) {
  const { isAuthenticated } = useAuth();
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const repostMutation = useRepost();
  const deleteRepostMutation = useDeleteRepost();

  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [repostCount, setRepostCount] = useState(post.repostCount ?? 0);
  const [isLiked, setIsLiked] = useState(!!post.viewer?.like);
  const [isReposted, setIsReposted] = useState(!!post.viewer?.repost);

  const composerRef = useRef<CompopserRef>(null);

  const handleLike = useCallback(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    if (post.viewer?.like) {
      // Unlike the post
      unlikePostMutation.mutate(
        { likeUri: post.viewer.like },
        {
          //fallback to defualt like state
          onError: () => {
            setLikeCount(post.likeCount);
            setIsLiked(!!post.viewer?.like);
          },
        }
      );
    } else {
      // Like the post
      likePostMutation.mutate(
        { uri: post.uri, cid: post.cid },
        {
          onError: () => {
            //fallback to defualt like state
            setLikeCount(post.likeCount);
            setIsLiked(!!post.viewer?.like);
          },
        }
      );
    }

    onLike?.(post.uri, post.cid);
  }, [
    isAuthenticated,
    post,
    isLiked,
    unlikePostMutation,
    likePostMutation,
    onLike,
  ]);

  const handleRepost = useCallback(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setIsReposted((prev) => !prev);
    setRepostCount((prev) => (isReposted ? prev - 1 : prev + 1));
    if (post.viewer?.repost) {
      // Delete repost
      deleteRepostMutation.mutate(
        { repostUri: post.viewer.repost },
        {
          onError: () => {
            //fallback to defualt repost state
            setRepostCount(post.repostCount);
            setIsReposted(!!post.viewer?.repost);
          },
        }
      );
    } else {
      // Create repost
      repostMutation.mutate(
        { uri: post.uri, cid: post.cid },
        {
          onError: () => {
            setRepostCount(post.repostCount);
            setIsReposted(!!post.viewer?.repost);
          },
        }
      );
    }

    onRepost?.(post.uri, post.cid);
  }, [
    post,
    repostMutation,
    isAuthenticated,
    deleteRepostMutation,
    onRepost,
    isReposted,
  ]);

  const handleComment = useCallback(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      composerRef.current?.open();
    }
  }, [isAuthenticated]);

  const handleShare = useCallback(() => {
    onShare?.(post.uri, post.cid);
  }, [post.uri, post.cid, onShare]);

  return (
    <View style={styles.actions}>
      <HapticTab
        icon={MessageCircle}
        iconSize={isDetailView ? 22 : 20}
        count={post.replyCount}
        onPress={handleComment}
        hapticType="light"
      />
      <HapticTab
        icon={Repeat2}
        iconSize={isDetailView ? 22 : 20}
        count={repostCount}
        isActive={isReposted}
        onPress={handleRepost}
        hapticType="medium"
      />
      <HapticTab
        icon={Heart}
        iconSize={isDetailView ? 22 : 20}
        count={likeCount}
        isActive={isLiked}
        onPress={handleLike}
        hapticType="success"
      />
      <HapticTab
        icon={Share}
        iconSize={isDetailView ? 22 : 20}
        variant="share"
        onPress={handleShare}
        hapticType="light"
      />
      {
        // compose message
      }
      <Composer
        replyTo={{
          post,
        }}
        ref={composerRef}
        onClose={() => {}}
        onPost={() => {}}
        onPostStateChange={() => {}}
        onPostTrigger={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingTop: 10,
  },
});
