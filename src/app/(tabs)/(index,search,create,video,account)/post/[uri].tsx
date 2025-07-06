import React, { useCallback } from "react";
import { StyleSheet, Platform, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Header } from "@/components/Header";
import { Post } from "@/components/Post";
import { List } from "@/components/list";
import { PostScreenPlaceholder } from "@/components/placeholders";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePostThread,
  useLikePost,
  useUnlikePost,
  useRepost,
  useDeleteRepost,
} from "@/lib/queries";
import { Text, View } from "@/components/ui";
import { ATPost, ATThreadViewPost } from "@/types/atproto";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function PostScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const { isAuthenticated } = useAuth();

  const tabBarHeight = useBottomTabBarHeight();

  const decodedUri = uri ? decodeURIComponent(uri) : "";

  // Queries and mutations
  const postThreadQuery = usePostThread(decodedUri);
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const repostMutation = useRepost();
  const deleteRepostMutation = useDeleteRepost();

  const thread = postThreadQuery.data?.thread;
  const post = thread?.post as ATPost | undefined;
  const replies = (thread?.replies as ATThreadViewPost[]) || [];

  const handleLike = useCallback(
    async (
      postUri: string,
      cid: string,
      isLiked: boolean,
      likeUri?: string
    ) => {
      if (!isAuthenticated) {
        Alert.alert("Authentication Required", "Please log in to like posts");
        return;
      }

      try {
        if (isLiked && likeUri) {
          await unlikePostMutation.mutateAsync({ likeUri });
        } else {
          await likePostMutation.mutateAsync({ uri: postUri, cid });
        }
      } catch (error) {
        Alert.alert("Error", "Failed to update like status");
      }
    },
    [isAuthenticated, unlikePostMutation, likePostMutation]
  );

  const handleRepost = useCallback(
    async (
      postUri: string,
      cid: string,
      isReposted: boolean,
      repostUri?: string
    ) => {
      if (!isAuthenticated) {
        Alert.alert("Authentication Required", "Please log in to repost");
        return;
      }

      try {
        if (isReposted && repostUri) {
          await deleteRepostMutation.mutateAsync({ repostUri });
        } else {
          await repostMutation.mutateAsync({ uri: postUri, cid });
        }
      } catch (error) {
        Alert.alert("Error", "Failed to update repost status");
      }
    },
    [isAuthenticated, deleteRepostMutation, repostMutation]
  );

  const handleReply = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert("Authentication Required", "Please log in to reply to posts");
      return;
    }

    if (!post) return;

    // Navigate to composer modal with reply data
    const replyData = encodeURIComponent(JSON.stringify(post));
    router.push(
      `/(modal)/composer?replyTo=${replyData}&parentUri=${post.uri}&parentCid=${post.cid}&rootUri=${post.uri}&rootCid=${post.cid}`
    );
  }, [isAuthenticated, post, router]);

  const handleShare = useCallback(async () => {
    if (!post) return;

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
          await navigator.clipboard.writeText(shareUrl);
          Alert.alert("Copied", "Post URL copied to clipboard");
        }
      } else {
        Alert.alert("Share", `Share this post: ${shareUrl}`);
      }
    } catch (error) {
      console.error("Failed to share post:", error);
      Alert.alert("Error", "Failed to share post");
    }
  }, [post]);

  const renderReplyItem = useCallback(
    ({ item }: { item: ATThreadViewPost }) => {
      const replyPost = item.post;
      return (
        <View style={styles.replyItem}>
          <Post
            post={replyPost}
            onLike={(uri, cid) =>
              handleLike(
                uri,
                cid,
                !!replyPost.viewer?.like,
                replyPost.viewer?.like
              )
            }
            onRepost={(uri, cid) =>
              handleRepost(
                uri,
                cid,
                !!replyPost.viewer?.repost,
                replyPost.viewer?.repost
              )
            }
            onComment={() => {}}
            isReply={true}
          />
        </View>
      );
    },
    [handleLike, handleRepost]
  );

  const renderEmptyReplies = useCallback(
    () => (
      <View style={styles.noReplies}>
        <Text style={styles.noRepliesText}>No replies yet</Text>
        <Text style={styles.noRepliesSubtext}>Be the first to reply!</Text>
      </View>
    ),
    []
  );

  const renderListHeader = useCallback(
    () => (
      <>
        {/* Main Post */}
        {post && (
          <View style={styles.mainPost}>
            <Post
              post={post}
              onLike={(uri, cid) =>
                handleLike(uri, cid, !!post.viewer?.like, post.viewer?.like)
              }
              onRepost={(uri, cid) =>
                handleRepost(
                  uri,
                  cid,
                  !!post.viewer?.repost,
                  post.viewer?.repost
                )
              }
              onComment={handleReply}
              isDetailView={true}
            />
          </View>
        )}

        {/* Replies Header */}
        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>
            {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
          </Text>
        </View>
      </>
    ),
    [post, handleLike, handleRepost, handleShare, handleReply, replies.length]
  );

  if (postThreadQuery.isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Post" />
        <PostScreenPlaceholder />
      </View>
    );
  }

  if (postThreadQuery.error || !post) {
    return (
      <View style={styles.container}>
        <Header title="Post" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {postThreadQuery.error?.message || "Post not found"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header title="Post" />
      <List
        data={replies}
        renderItem={renderReplyItem}
        keyExtractor={(item) => item.post.uri}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyReplies}
        showsVerticalScrollIndicator={false}
        refreshing={postThreadQuery.isFetching}
        onRefresh={postThreadQuery.refetch}
        contentContainerStyle={{
          paddingBottom: tabBarHeight,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
  },
  mainPost: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },

  repliesSection: {
    paddingTop: 16,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  replyItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  noReplies: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  noRepliesText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  noRepliesSubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
});
