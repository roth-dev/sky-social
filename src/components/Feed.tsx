import { useAuth } from "@/contexts/AuthContext";
import React, { useCallback, useMemo, useState } from "react";
import { ATFeedItem } from "@/types/atproto";
import { isIOS, isNative } from "@/platform";
import { Text, View } from "./ui";
import { EmptyState, ErrorState } from "./placeholders/EmptyState";
import { FeedPlaceholder } from "./placeholders/FeedPlaceholder";
import { List } from "./list";
import { Post } from "./Post";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Loading from "./ui/Loading";
import { isVideoPost } from "@/utils/embedUtils";
import { FeedDescriptor } from "@/lib/atproto";
import { useFeeds } from "@/hooks/query/useFeeds";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

interface FeedProps {
  isFocused?: boolean;
  headerHeight?: number;
  feed: FeedDescriptor;
}
const Feed = React.memo(function Comp({
  headerHeight,
  isFocused,
  feed,
}: FeedProps) {
  const { isAuthenticated } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();

  const feedQuery = useFeeds(feed);

  const handleLoadMore = useCallback(() => {
    if (
      feedQuery.hasNextPage &&
      !feedQuery.isFetchingNextPage &&
      !feedQuery.isLoading
    ) {
      feedQuery.fetchNextPage();
    }
  }, [feedQuery]);

  const allPosts = useMemo(() => {
    const pages = feedQuery.data?.pages;
    return pages?.flatMap((page) => page?.feed) || [];
  }, [feedQuery.data]);

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
      />
    ),
    [visiblePostUris, isScrolling, isFocused]
  );

  const renderLoadingFooter = useCallback(() => {
    if (!feedQuery.isFetchingNextPage) return null;

    return (
      <View className="py-5 items-center bg-white gap-2">
        <Loading />
        <Text className="text-sm text-gray-500 font-medium">
          Loading more posts...
        </Text>
      </View>
    );
  }, [feedQuery.isFetchingNextPage]);

  const renderEmptyState = useCallback(
    () => (
      <EmptyState
        type="timeline"
        title={t`Welcome to Sky Social!`}
        description={
          isAuthenticated
            ? t`Follow people to see their posts in your timeline. Discover new accounts in the search tab!`
            : t`Discover posts from the decentralized social web. Sign in to interact with posts and see your personalized timeline.`
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
          <Trans>Sign in required</Trans>
        </Text>
        <Text className="text-gray-500 mb-4 text-center">
          <Trans>
            Please sign in to view your personalized feed and interact with
            posts.
          </Trans>
        </Text>
        {/* You can add a button to navigate to login if needed */}
      </View>
    );
  }

  // Show loading placeholder on initial load
  if (feedQuery.isLoading) {
    return (
      <View className="flex-1">
        <FeedPlaceholder count={6} showVariety={true} includeVideos={true} />
      </View>
    );
  }

  // Show error state
  if (feedQuery.error) {
    return (
      <View className="flex-1 bg-white">
        <ErrorState
          title={t`Unable to load timeline`}
          description={
            feedQuery.error?.message ||
            t`Something went wrong while loading the timeline. Please try again.`
          }
          onRetry={() => feedQuery.refetch()}
        />
      </View>
    );
  }

  // Only show empty state if we have no posts AND we're not loading
  const showEmptyState = allPosts.length === 0 && !feedQuery.isLoading;
  return (
    <List
      data={allPosts}
      extraData={allPosts}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.post.uri}-${index}`}
      headerOffset={headerHeight}
      useScrollDetector
      refreshing={feedQuery.isRefetching}
      onRefresh={() => feedQuery.refetch()}
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
