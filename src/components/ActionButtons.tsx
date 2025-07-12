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

  const [isLiked, setIsLiked] = useState(!!post.viewer?.like);
  const [isReposted, setIsReposted] = useState(!!post.viewer?.repost);

  const currentLikeState = useRef<boolean>(!!post.viewer?.like);
  const currentRepostState = useRef<boolean>(!!post.viewer?.repost);

  const handleLike = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }
    setIsLiked(!isLiked);

    if (post.viewer?.like) {
      // Unlike the post
      unlikePostMutation.mutate(
        { likeUri: post.viewer.like },
        {
          onSuccess: () => {
            currentLikeState.current = !isLiked;
          },
          onError: () => {
            setIsLiked(currentLikeState.current);
          },
        }
      );
    } else {
      // Like the post
      likePostMutation.mutate(
        { uri: post.uri, cid: post.cid },
        {
          onSuccess: () => {
            currentLikeState.current = !isLiked;
          },
          onError: () => {
            setIsLiked(currentLikeState.current);
          },
        }
      );
    }

    onLike?.(post.uri, post.cid);
  }, [
    isAuthenticated,
    post,
    unlikePostMutation,
    likePostMutation,
    onLike,
    currentLikeState,
    isLiked,
  ]);

  const handleRepost = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }
    setIsReposted(!isReposted);
    if (post.viewer?.repost) {
      // Delete repost
      deleteRepostMutation.mutate(
        { repostUri: post.viewer.repost },
        {
          onSuccess: () => {
            currentRepostState.current = !isReposted;
          },
          onError: () => {
            setIsReposted(currentRepostState.current);
          },
        }
      );
    } else {
      // Create repost
      repostMutation.mutate(
        { uri: post.uri, cid: post.cid },
        {
          onSuccess: () => {
            currentRepostState.current = !isReposted;
          },
          onError: () => {
            setIsReposted(currentRepostState.current);
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
    currentRepostState,
  ]);

  const handleComment = useCallback(() => {
    onComment?.(post.uri, post.cid);
  }, [post.uri, post.cid, onComment]);

  const handleShare = useCallback(() => {
    onShare?.(post.uri, post.cid);
  }, [post.uri, post.cid, onShare]);

  return (
    <View style={[styles.actions, isDetailView && styles.detailActions]}>
      <HapticTab
        icon={MessageCircle}
        iconSize={isDetailView ? 22 : 20}
        count={!isDetailView ? post.replyCount : 0}
        onPress={handleComment}
        hapticType="light"
      />
      <HapticTab
        icon={Repeat2}
        iconSize={isDetailView ? 22 : 20}
        count={!isDetailView ? post.repostCount : 0}
        isActive={isReposted}
        onPress={handleRepost}
        hapticType="medium"
      />
      <HapticTab
        icon={Heart}
        iconSize={isDetailView ? 22 : 20}
        count={!isDetailView ? post.likeCount : 0}
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
    </View>
  );
}

const styles = StyleSheet.create({
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
