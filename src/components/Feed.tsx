import { useTimeline } from "@/hooks/query/useTimeline";
import { useLikePost } from "@/hooks/mutation/useLikePost";
import { useUnlikePost } from "@/hooks/mutation/useUnlikePost";
import { useRepost } from "@/hooks/mutation/useRepost";
import { useDeleteRepost } from "@/hooks/mutation/useDeleteRepost";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ATFeedItem } from "@/types/atproto";
import { isIOS, isAndroid, isNative, isWeb } from "@/platform";
import { Text, View } from "./ui";
import { EmptyState, ErrorState } from "./placeholders/EmptyState";
import { FeedPlaceholder } from "./placeholders/FeedPlaceholder";
import { List } from "./list";
import { Post } from "./Post";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Loading from "./ui/Loading";
import { isVideoPost } from "@/utils/embedUtils";

interface FeedProps {
  isFocused?: boolean;
  headerHeight?: number;
}
const Feed = React.memo(function Comp({ headerHeight, isFocused }: FeedProps) {
  const { isAuthenticated } = useAuth();
  const timelineQuery = useTimeline();
  const tabBarHeight = useBottomTabBarHeight();

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

  const [visiblePostUris, setVisiblePostUris] = useState<Set<string>>(
    new Set()
  );
  const [isScrolling, setIsScrolling] = useState(false);

  const handleViewableItemsChangedFull = useCallback((items: ATFeedItem[]) => {
    const firstVisibleVideo = items.find((item) => isVideoPost(item.post));
    setVisiblePostUris(
      firstVisibleVideo && firstVisibleVideo.post?.uri
        ? new Set([firstVisibleVideo.post.uri])
        : new Set()
    );
  }, []);

  const handleScrollStateChange = useCallback((scrolling: boolean) => {
    setIsScrolling(scrolling);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ATFeedItem }) => (
      <Post
        post={item.post}
        shouldPlay={
          !isScrolling && visiblePostUris.has(item.post.uri) && isFocused
        }
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
    [visiblePostUris, isScrolling, isFocused]
  );

  const renderLoadingFooter = useCallback(() => {
    if (!timelineQuery.isFetchingNextPage) return null;

    return (
      <View className="py-5 items-center bg-white gap-2">
        <Loading />
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

  // If on native (iOS/Android) and not authenticated, show login prompt
  if (isNative && !isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-xl font-bold mb-2 text-center">
          Sign in required
        </Text>
        <Text className="text-gray-500 mb-4 text-center">
          Please sign in to view your personalized feed and interact with posts.
        </Text>
        {/* You can add a button to navigate to login if needed */}
      </View>
    );
  }

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
      headerOffset={headerHeight}
      useScrollDetector
      refreshing={timelineQuery.isRefetching}
      onRefresh={() => timelineQuery.refetch()}
      onEndReached={handleLoadMore}
      ListEmptyComponent={showEmptyState ? renderEmptyState : null}
      ListFooterComponent={renderLoadingFooter}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        showEmptyState
          ? { flex: 1 }
          : {
              paddingTop: headerHeight,
              paddingBottom: tabBarHeight,
            }
      }
      removeClippedSubviews
      initialNumToRender={2}
      windowSize={9}
      maxToRenderPerBatch={isIOS ? 5 : 1}
      updateCellsBatchingPeriod={40}
      onEndReachedThreshold={3} // number of posts left to trigger load more
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      onViewableItemsChangedFull={handleViewableItemsChangedFull}
      onScrollStateChange={handleScrollStateChange}
    />
  );
});

export { Feed };
