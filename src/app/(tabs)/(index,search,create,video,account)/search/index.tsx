import React, { useState, useEffect, useMemo } from "react";
import { SearchHeader } from "@/components/search/SearchHeader";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import { TrendingSection } from "@/components/search/TrendingSection";
import { useSuggestedFollows } from "@/hooks/query/useSuggestedFollows";
import { usePopularFeeds } from "@/hooks/query/usePopularFeeds";
import {
  SearchFilters as SearchFiltersType,
  SearchState,
} from "@/types/search";
import { useLocalSearchParams } from "expo-router";
import { View } from "@/components/ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSearchActors, useSearchPosts } from "@/hooks/query";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { Header } from "@/components/Header";

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const { colorScheme } = useSettings();
  const [searchState, setSearchState] = useState<SearchState>({
    query: q ?? "",
    filters: {
      type: "users",
      sortBy: "relevance",
      timeRange: "all",
    },
    isSearching: false,
    hasSearched: false,
  });

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Search queries
  const searchActorsQuery = useSearchActors(debouncedQuery);
  const searchPostsQuery = useSearchPosts(debouncedQuery);

  // Discovery queries - pass authentication status
  const suggestedFollowsQuery = useSuggestedFollows();
  const popularFeedsQuery = usePopularFeeds();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchState.query);
      if (searchState.query.trim().length > 0) {
        setSearchState((prev) => ({ ...prev, hasSearched: true }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchState.query]);

  // Update searching state
  useEffect(() => {
    const isSearching =
      searchActorsQuery.isLoading || searchPostsQuery.isLoading;
    setSearchState((prev) => ({ ...prev, isSearching }));
  }, [searchActorsQuery.isLoading, searchPostsQuery.isLoading]);

  const handleQueryChange = (query: string) => {
    setSearchState((prev) => ({ ...prev, query }));
  };

  const handleClearSearch = () => {
    setSearchState((prev) => ({
      ...prev,
      query: "",
      hasSearched: false,
    }));
    setDebouncedQuery("");
  };

  const handleFiltersChange = (filters: SearchFiltersType) => {
    setSearchState((prev) => ({ ...prev, filters }));
  };

  const handleLoadMore = () => {
    switch (searchState.filters.type) {
      case "users":
        if (
          searchActorsQuery.hasNextPage &&
          !searchActorsQuery.isFetchingNextPage
        ) {
          searchActorsQuery.fetchNextPage();
        }
        break;
      case "posts":
        if (
          searchPostsQuery.hasNextPage &&
          !searchPostsQuery.isFetchingNextPage
        ) {
          searchPostsQuery.fetchNextPage();
        }
        break;
      case "feeds":
        // Feeds don't have pagination in this implementation
        break;
    }
  };

  const handleRefresh = () => {
    switch (searchState.filters.type) {
      case "users":
        searchActorsQuery.refetch();
        break;
      case "posts":
        searchPostsQuery.refetch();
        break;
      case "feeds":
        popularFeedsQuery.refetch();
        break;
    }
  };

  // Get current search data based on active filter
  const getCurrentSearchData = () => {
    switch (searchState.filters.type) {
      case "users":
        return (
          searchActorsQuery.data?.pages.flatMap((page) => page?.actors) || []
        );
      case "posts":
        return (
          searchPostsQuery.data?.pages.flatMap((page) => page?.posts) || []
        );
      case "feeds":
        return popularFeedsQuery.data?.feeds || [];
      default:
        return [];
    }
  };

  const getCurrentLoading = () => {
    switch (searchState.filters.type) {
      case "users":
        return searchActorsQuery.isLoading;
      case "posts":
        return searchPostsQuery.isLoading;
      case "feeds":
        return popularFeedsQuery.isLoading;
      default:
        return false;
    }
  };

  const getCurrentLoadingMore = () => {
    switch (searchState.filters.type) {
      case "users":
        return searchActorsQuery.isFetchingNextPage;
      case "posts":
        return searchPostsQuery.isFetchingNextPage;
      case "feeds":
        return false;
      default:
        return false;
    }
  };

  // Calculate result counts for filter badges
  const resultCounts = useMemo(
    () => ({
      users:
        searchActorsQuery.data?.pages.flatMap((page) => page?.actors).length ||
        0,
      posts:
        searchPostsQuery.data?.pages.flatMap((page) => page?.posts).length || 0,
      feeds: popularFeedsQuery.data?.feeds.length || 0,
    }),
    [searchActorsQuery.data, searchPostsQuery.data, popularFeedsQuery.data]
  );

  const showSearchResults =
    searchState.hasSearched && debouncedQuery.trim().length > 0;
  const showTrending = !showSearchResults;

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: Colors.background.primary[colorScheme],
      }}
    >
      <Header title="Search" disabledLeft />
      <View className="flex-1 bg-white">
        <SearchHeader
          query={searchState.query}
          onQueryChange={handleQueryChange}
          onClear={handleClearSearch}
          autoFocus={false}
        />

        {showSearchResults && (
          <SearchFilters
            filters={searchState.filters}
            onFiltersChange={handleFiltersChange}
            resultCounts={searchState.hasSearched ? resultCounts : undefined}
          />
        )}

        {showTrending ? (
          <TrendingSection
            suggestedUsers={suggestedFollowsQuery.data?.actors}
            popularFeeds={popularFeedsQuery.data?.feeds}
          />
        ) : (
          <SearchResults
            type={searchState.filters.type}
            data={getCurrentSearchData()}
            loading={getCurrentLoading()}
            loadingMore={getCurrentLoadingMore()}
            hasSearched={searchState.hasSearched}
            query={debouncedQuery}
            onLoadMore={handleLoadMore}
            onRefresh={handleRefresh}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
