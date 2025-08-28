import React, { useCallback, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Header } from "@/components/Header";
import { SearchHeader } from "@/components/search/SearchHeader";
import { UserSearchResult } from "@/components/search/UserSearchResult";
import { EmptyState, LoadingState } from "@/components/placeholders/EmptyState";
import { SearchActor } from "@/types/search";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useSearchActors, useSuggestedFollows } from "@/hooks/query";
import { List } from "@/components/list";
import { View } from "@/components/ui";

export default function PeopleListScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Search queries
  const searchActorsQuery = useSearchActors(debouncedQuery);
  const suggestedFollowsQuery = useSuggestedFollows();

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
  };

  const handleLoadMore = useCallback(() => {
    if (
      searchActorsQuery.hasNextPage &&
      !searchActorsQuery.isFetchingNextPage
    ) {
      searchActorsQuery.fetchNextPage();
    }
  }, [searchActorsQuery]);

  const renderUserItem = useCallback(
    ({ item }: { item: SearchActor }) => <UserSearchResult user={item} />,
    []
  );

  const renderLoadingFooter = () => {
    if (!searchActorsQuery.isFetchingNextPage) return null;

    return (
      <View style={styles.loadingFooter}>
        <View style={styles.loadingSpinner} />
        <Text style={styles.loadingText}>Loading more people...</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (searchActorsQuery.isLoading) {
      return (
        <LoadingState
          message="Searching for people..."
          style={styles.emptyState}
        />
      );
    }

    if (debouncedQuery.trim().length === 0) {
      return (
        <EmptyState
          type="followers"
          title="Suggested People"
          description="Here are some people you might want to follow. Use the search bar to find specific users."
          style={styles.emptyState}
        />
      );
    }

    return (
      <EmptyState
        type="followers"
        title="No people found"
        description={`No users found for "${debouncedQuery}". Try searching with a different term or handle.`}
        style={styles.emptyState}
      />
    );
  };

  // Get data based on search state
  const getData = () => {
    if (debouncedQuery.trim().length > 0) {
      return searchActorsQuery.data?.pages.flatMap((page) => page.actors) || [];
    }
    return suggestedFollowsQuery.data?.actors || [];
  };

  const getLoading = () => {
    if (debouncedQuery.trim().length > 0) {
      return searchActorsQuery.isLoading;
    }
    return suggestedFollowsQuery.isLoading;
  };

  const data = getData();
  const loading = getLoading();

  return (
    <View className="flex-1">
      <Header title="People" />

      <SearchHeader
        query={searchQuery}
        onQueryChange={handleQueryChange}
        onClear={handleClearSearch}
        placeholder="Search people..."
        autoFocus={false}
      />

      <List
        data={data}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.did}
        contentContainerStyle={
          data.length === 0 ? styles.emptyContainer : undefined
        }
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={1.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoadingFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
