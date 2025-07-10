import React, { useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Header } from "@/components/Header";
import { Post } from "@/components/Post";
import { List } from "@/components/list";
import { PostScreenPlaceholder } from "@/components/placeholders";
import { usePostThread } from "@/hooks/query/usePostThread";
import { Text, View } from "@/components/ui";
import { ATPost, ATThreadViewPost } from "@/types/atproto";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { isIOS } from "@/platform";

export default function PostScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();

  const tabBarHeight = useBottomTabBarHeight();

  const postThreadQuery = usePostThread(uri);

  const [post, replies] = useMemo(() => {
    const thread = postThreadQuery.data?.thread;
    const post = thread?.post as ATPost;
    const replies = (thread?.replies as ATThreadViewPost[]) || [];
    return [post, replies];
  }, [postThreadQuery]);

  const renderReplyItem = useCallback(
    ({ item }: { item: ATThreadViewPost }) => {
      const replyPost = item.post;
      return (
        <View style={styles.replyItem}>
          <Post post={replyPost} isReply={true} />
        </View>
      );
    },
    []
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
        {post && (
          <View style={styles.mainPost}>
            <Post post={post} isDetailView={true} />
          </View>
        )}

        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>
            {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
          </Text>
        </View>
      </>
    ),
    [post, replies.length]
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
        removeClippedSubviews
        windowSize={9}
        initialNumToRender={5}
        maxToRenderPerBatch={isIOS ? 5 : 1}
        updateCellsBatchingPeriod={40}
        onEndReachedThreshold={3} // number of posts left to trigger load more
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
