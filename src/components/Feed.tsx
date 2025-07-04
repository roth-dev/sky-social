import {
  useDeleteRepost,
  useLikePost,
  useRepost,
  useTimeline,
  useUnlikePost,
} from "@/lib/queries";
import { RefreshControl } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { ATFeedItem } from "@/types/atproto";
import { isIOS } from "@/platform";
import { Text, View } from "./ui";
import { EmptyState, ErrorState } from "./placeholders/EmptyState";
import { FeedPlaceholder } from "./placeholders/FeedPlaceholder";
import { List } from "./list";
import { Post } from "./Post";

const Feed = React.memo(function Impl() {
  const { isAuthenticated } = useAuth();
  const timelineQuery = useTimeline();
  // const likePostMutation = useLikePost();
  // const unlikePostMutation = useUnlikePost();
  // const repostMutation = useRepost();
  // const deleteRepostMutation = useDeleteRepost();

  // const handleLike = useCallback(
  //   async (uri: string, cid: string, isLiked: boolean, likeUri?: string) => {
  //     if (!isAuthenticated) {
  //       // For unauthenticated users, show a prompt to sign in
  //       router.push("/profile");
  //       return;
  //     }

  //     if (isLiked && likeUri) {
  //       unlikePostMutation.mutate({ likeUri });
  //     } else {
  //       likePostMutation.mutate({ uri, cid });
  //     }
  //   },
  //   [unlikePostMutation, likePostMutation, isAuthenticated]
  // );

  // const handleRepost = useCallback(
  //   async (
  //     uri: string,
  //     cid: string,
  //     isReposted: boolean,
  //     repostUri?: string
  //   ) => {
  //     if (!isAuthenticated) {
  //       // For unauthenticated users, show a prompt to sign in
  //       router.push("/profile");
  //       return;
  //     }

  //     if (isReposted && repostUri) {
  //       deleteRepostMutation.mutate({ repostUri });
  //     } else {
  //       repostMutation.mutate({ uri, cid });
  //     }
  //   },
  //   [isAuthenticated, deleteRepostMutation, repostMutation]
  // );

  const handleComment = (uri: string) => {
    const safeUri = encodeURIComponent(uri);
    router.push(`/post/${safeUri}`);
  };

  const handleLoadMore = useCallback(() => {
    if (
      timelineQuery.hasNextPage &&
      !timelineQuery.isFetchingNextPage &&
      !timelineQuery.isLoading
    ) {
      timelineQuery.fetchNextPage();
    }
  }, [timelineQuery]);

  const allPosts = useMemo(() => {
    return timelineQuery.data?.pages.flatMap((page) => page?.feed) || [];
  }, [timelineQuery.data]);

  const renderItem = useCallback(
    ({ item }: { item: ATFeedItem }) => (
      <Post
        post={item.post}
        // onLike={(uri, cid) =>
        //   handleLike(uri, cid, !!item.post.viewer?.like, item.post.viewer?.like)
        // }
        // onRepost={(uri, cid) =>
        //   handleRepost(
        //     uri,
        //     cid,
        //     !!item.post.viewer?.repost,
        //     item.post.viewer?.repost
        //   )
        // }
        // onComment={handleComment}
      />
    ),
    []
  );

  const renderLoadingFooter = useCallback(() => {
    if (!timelineQuery.isFetchingNextPage) return null;

    return (
      <View className="py-5 items-center bg-white gap-2">
        <View className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-blue-500" />
        <Text className="text-sm text-gray-500 font-medium">
          Loading more posts...
        </Text>
      </View>
    );
  }, [timelineQuery.isFetchingNextPage]);

  const renderEmptyState = useCallback(
    () => (
      <EmptyState
        type="timeline"
        title="Welcome to Sky Social!"
        description={
          isAuthenticated
            ? "Follow people to see their posts in your timeline. Discover new accounts in the search tab!"
            : "Discover posts from the decentralized social web. Sign in to interact with posts and see your personalized timeline."
        }
      />
    ),
    [isAuthenticated]
  );

  // Show loading placeholder on initial load
  if (timelineQuery.isLoading) {
    return (
      <View className="flex-1">
        <FeedPlaceholder count={6} showVariety={true} includeVideos={true} />
      </View>
    );
  }

  // Show error state
  if (timelineQuery.error) {
    return (
      <View className="flex-1 bg-white">
        <ErrorState
          title="Unable to load timeline"
          description={
            timelineQuery.error?.message ||
            "Something went wrong while loading the timeline. Please try again."
          }
          onRetry={() => timelineQuery.refetch()}
        />
      </View>
    );
  }

  // Only show empty state if we have no posts AND we're not loading
  const showEmptyState = allPosts.length === 0 && !timelineQuery.isLoading;

  return (
    <List
      data={allPosts}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.post.uri}-${index}`}
      className="flex-1"
      refreshControl={
        <RefreshControl
          refreshing={timelineQuery.isRefetching}
          onRefresh={() => timelineQuery.refetch()}
          tintColor="#3b82f6"
          colors={["#3b82f6"]}
        />
      }
      onEndReached={handleLoadMore}
      ListEmptyComponent={showEmptyState ? renderEmptyState : null}
      ListFooterComponent={renderLoadingFooter}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={showEmptyState ? { flex: 1 } : undefined}
      removeClippedSubviews
      initialNumToRender={2}
      windowSize={9}
      maxToRenderPerBatch={isIOS ? 5 : 1}
      updateCellsBatchingPeriod={40}
      onEndReachedThreshold={1} // number of posts left to trigger load more
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
    />
  );
});

export { Feed };
