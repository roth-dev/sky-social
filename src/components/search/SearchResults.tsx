import React from "react";
import { StyleSheet } from "react-native";
import { UserSearchResult } from "./UserSearchResult";
import { PostSearchResult } from "./PostSearchResult";
import { FeedSearchResult } from "./FeedSearchResult";
import { EmptyState, LoadingState } from "@/components/placeholders/EmptyState";
import { SearchResultType, SearchActor, FeedGenerator } from "@/types/search";
import { ATPost } from "@/types/atproto";
import { Text, View } from "../ui";
import { List } from "../list";
import { t } from "@lingui/core/macro";

interface SearchResultsProps {
  type: SearchResultType;
  data: unknown[];
  loading: boolean;
  loadingMore: boolean;
  hasSearched: boolean;
  query: string;
  onLoadMore: () => void;
}

type SearchResultItem = SearchActor | ATPost | FeedGenerator;

export function SearchResults({
  type,
  data,
  loading,
  loadingMore,
  hasSearched,
  query,
  onLoadMore,
}: SearchResultsProps) {
  // Wrappers to fix typing for List
  const renderItemWrapper = React.useCallback(
    (info: { item: unknown }) => {
      if (type === "users") {
        return <UserSearchResult user={info.item as SearchActor} />;
      } else if (type === "posts") {
        return <PostSearchResult post={info.item as ATPost} />;
      } else if (type === "feeds") {
        return <FeedSearchResult feed={info.item as FeedGenerator} />;
      }
      return null;
    },
    [type]
  );

  const getKeyExtractor = (item: unknown, index: number) => {
    const typedItem = item as SearchResultItem;
    switch (type) {
      case "users":
        return (typedItem as SearchActor).did || `user-${index}`;
      case "posts":
        return (typedItem as ATPost).uri || `post-${index}`;
      case "feeds":
        return (typedItem as FeedGenerator).uri || `feed-${index}`;
      default:
        return `item-${index}`;
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && !loading && data.length > 0) {
      onLoadMore();
    }
  };

  const renderLoadingFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <View style={styles.loadingSpinner} />
        <Text style={styles.loadingText}>Loading more results...</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <LoadingState
          message={t`Searching for ${type}...`}
          style={styles.emptyState}
        />
      );
    }

    if (!hasSearched) {
      return (
        <EmptyState
          type="search"
          title={t`Start searching`}
          description={t`Enter a search term to find people, posts, and feeds on Bluesky.`}
          style={styles.emptyState}
        />
      );
    }

    if (query.trim().length === 0) {
      return (
        <EmptyState
          type="search"
          title={t`Enter a search term`}
          description={t`Type something to search for people, posts, and feeds.`}
          style={styles.emptyState}
        />
      );
    }

    const emptyConfig = getEmptyStateConfig(type, query);
    return (
      <EmptyState
        type="search"
        title={emptyConfig.title}
        description={emptyConfig.description}
        style={styles.emptyState}
      />
    );
  };

  const getEmptyStateConfig = (
    searchType: SearchResultType,
    searchQuery: string
  ) => {
    switch (searchType) {
      case "users":
        return {
          title: t`No people found`,
          description: t`No users found for "${searchQuery}". Try searching with a different term or handle.`,
        };
      case "posts":
        return {
          title: t`No posts found`,
          description: t`No posts found for "${searchQuery}". Try searching with different keywords.`,
        };
      case "feeds":
        return {
          title: t`No feeds found`,
          description: t`No custom feeds found for "${searchQuery}". Try browsing popular feeds instead.`,
        };
      default:
        return {
          title: t`No results found`,
          description: t`No results found for "${searchQuery}". Try a different search term.`,
        };
    }
  };

  return (
    <List
      data={data}
      renderItem={renderItemWrapper}
      keyExtractor={getKeyExtractor}
      style={styles.container}
      contentContainerStyle={
        data.length === 0 ? styles.emptyContainer : undefined
      }
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderLoadingFooter}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  loadingSpinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderTopColor: "#3b82f6",
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
});
