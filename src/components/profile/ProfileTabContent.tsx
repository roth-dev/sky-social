import React, { useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";
import { Post } from "@/components/Post";
import { EmptyState } from "@/components/placeholders/EmptyState";
import { ATFeedItem } from "@/types/atproto";
import TabList from "../tabs/List";
import Loading from "../ui/Loading";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Text, VStack } from "../ui";

interface ProfileTabContentProps {
  tabKey: string;
  data: ATFeedItem[];
  loading?: boolean;
  loadingMore?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
}
export function ProfileTabContent({
  tabKey,
  data = [],
  loading = false,
  loadingMore = false,
  onRefresh,
  onLoadMore,
  refreshing,
}: ProfileTabContentProps) {
  const barBarHeight = useBottomTabBarHeight();

  const getEmptyStateConfig = useCallback((key: string) => {
    switch (key) {
      case "posts":
        return {
          type: "posts" as const,
          title: "No posts yet",
          description: "When this user posts something, it will appear here.",
        };
      case "media":
        return {
          type: "media" as const,
          title: "No media yet",
          description:
            "When this user shares photos and videos, they will appear here.",
        };
      case "liked":
        return {
          type: "likes" as const,
          title: "No liked posts",
          description:
            "Liked posts may not be publicly available for this user.",
        };
      default:
        return {
          type: "posts" as const,
          title: "No content yet",
          description: "Content will appear here when available.",
        };
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    if (onLoadMore && !loadingMore && !loading && data.length > 0) {
      onLoadMore();
    }
  }, [loadingMore, onLoadMore, loading, data]);

  // Filter out null items for media tab
  const filteredData = useMemo(() => {
    return tabKey === "media"
      ? data.filter(
          (item) => item.post.embed?.images && item.post.embed.images.length > 0
        )
      : data;
  }, [data, tabKey]);

  const renderPostItem = useCallback(
    ({ item }: { item: ATFeedItem }) => (
      <Post
        post={item.post}
        onLike={() => {}}
        onRepost={() => {}}
        onComment={() => {}}
      />
    ),
    []
  );

  const renderLoadingFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <VStack className="flex-1 items-center m-4">
        <Loading size="large" />
        <Text>Loading more...</Text>
      </VStack>
    );
  }, [loadingMore]);

  const renderEmptyState = useCallback(() => {
    if (loading) return null;
    const emptyStateConfig = getEmptyStateConfig(tabKey);
    return (
      <EmptyState
        type={emptyStateConfig.type}
        title={emptyStateConfig.title}
        description={emptyStateConfig.description}
        style={styles.emptyState}
      />
    );
  }, [loading, getEmptyStateConfig, tabKey]);

  if (loading)
    return (
      <VStack className="flex-1 items-center m-4">
        <Loading size="large" />
        <Text>Loading...</Text>
      </VStack>
    );

  return (
    <TabList
      data={filteredData}
      renderItem={renderPostItem}
      keyExtractor={(item, index) => `${tabKey}-${item.post.uri}-${index}`}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderLoadingFooter}
      contentContainerStyle={{
        paddingBottom: barBarHeight,
      }}
    />
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
});
