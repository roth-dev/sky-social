import React, { useCallback, useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Header } from "@/components/Header";
import { SearchHeader } from "@/components/search/SearchHeader";
import { FeedSearchResult } from "@/components/search/FeedSearchResult";
import { EmptyState, LoadingState } from "@/components/placeholders/EmptyState";
import { FeedGenerator } from "@/types/search";
import { router } from "expo-router";
import { usePopularFeeds } from "@/hooks/query";
import { List } from "@/components/list";

const PAGE_SIZE = 20;

export default function FeedsListScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const popularFeedsQuery = usePopularFeeds();

  const handleQueryChange = (query: string) => {
    setSearchQuery(query);
    setVisibleCount(PAGE_SIZE); // Reset pagination on new search
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setVisibleCount(PAGE_SIZE);
  };

  const handleFeedPress = (feed: FeedGenerator) => {
    const safeUri = encodeURIComponent(feed.uri);
    router.push(`/profile/${feed.creator.handle}/feed/${safeUri}`);
  };

  // Filter feeds based on search query
  const filteredFeeds = useMemo(() => {
    const feeds = popularFeedsQuery.data?.feeds || [];
    if (searchQuery.trim().length === 0) {
      return feeds;
    }
    const query = searchQuery.toLowerCase();
    return feeds.filter(
      (feed) =>
        feed.displayName.toLowerCase().includes(query) ||
        feed.description?.toLowerCase().includes(query) ||
        feed.creator.handle.toLowerCase().includes(query) ||
        feed.creator.displayName?.toLowerCase().includes(query)
    );
  }, [popularFeedsQuery.data?.feeds, searchQuery]);

  // Paginate feeds for infinite scroll
  const paginatedFeeds = useMemo(() => {
    return filteredFeeds.slice(0, visibleCount);
  }, [filteredFeeds, visibleCount]);

  const handleLoadMore = () => {
    if (paginatedFeeds.length < filteredFeeds.length) {
      setVisibleCount((prev) =>
        Math.min(prev + PAGE_SIZE, filteredFeeds.length)
      );
    }
  };

  const renderFeedItem = useCallback(
    ({ item }: { item: FeedGenerator }) => (
      <FeedSearchResult feed={item} onPress={() => handleFeedPress(item)} />
    ),
    []
  );

  // Wrapper for List renderItem to fix typing
  const renderFeedItemWrapper = useCallback(
    (info: { item: unknown }) =>
      renderFeedItem({ item: info.item as FeedGenerator }),
    [renderFeedItem]
  );

  const renderEmptyState = () => {
    if (popularFeedsQuery.isLoading) {
      return (
        <LoadingState
          message="Loading popular feeds..."
          style={styles.emptyState}
        />
      );
    }
    return (
      <EmptyState
        type="search"
        title="No feeds found"
        description="No custom feeds are available at the moment. Check back later for new feeds created by the community."
        style={styles.emptyState}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Feeds" />
      <SearchHeader
        query={searchQuery}
        onQueryChange={handleQueryChange}
        onClear={handleClearSearch}
        placeholder="Search feeds..."
        autoFocus={false}
      />
      <List
        data={paginatedFeeds}
        renderItem={renderFeedItemWrapper}
        keyExtractor={(item) => (item as FeedGenerator).uri}
        style={styles.list}
        contentContainerStyle={
          paginatedFeeds.length === 0 ? styles.emptyContainer : undefined
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
  },
});
