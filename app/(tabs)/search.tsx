import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Header } from '@/components/Header';
import { SearchHeader } from '@/components/search/SearchHeader';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { TrendingSection } from '@/components/search/TrendingSection';
import { useSearchActors, useSearchPosts, useSuggestedFollows, usePopularFeeds, useLikePost, useUnlikePost, useRepost, useDeleteRepost } from '@/lib/queries';
import { SearchFilters as SearchFiltersType, SearchState } from '@/types/search';
import { router } from 'expo-router';

export default function SearchScreen() {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    filters: {
      type: 'users',
      sortBy: 'relevance',
      timeRange: 'all',
    },
    isSearching: false,
    hasSearched: false,
  });

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Search queries
  const searchActorsQuery = useSearchActors(debouncedQuery);
  const searchPostsQuery = useSearchPosts(debouncedQuery);
  
  // Discovery queries
  const suggestedFollowsQuery = useSuggestedFollows();
  const popularFeedsQuery = usePopularFeeds();

  // Post interaction mutations
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const repostMutation = useRepost();
  const deleteRepostMutation = useDeleteRepost();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchState.query);
      if (searchState.query.trim().length > 0) {
        setSearchState(prev => ({ ...prev, hasSearched: true }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchState.query]);

  // Update searching state
  useEffect(() => {
    const isSearching = searchActorsQuery.isLoading || searchPostsQuery.isLoading;
    setSearchState(prev => ({ ...prev, isSearching }));
  }, [searchActorsQuery.isLoading, searchPostsQuery.isLoading]);

  const handleQueryChange = (query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  };

  const handleClearSearch = () => {
    setSearchState(prev => ({ 
      ...prev, 
      query: '', 
      hasSearched: false 
    }));
    setDebouncedQuery('');
  };

  const handleFiltersChange = (filters: SearchFiltersType) => {
    setSearchState(prev => ({ ...prev, filters }));
  };

  const handleLoadMore = () => {
    switch (searchState.filters.type) {
      case 'users':
        if (searchActorsQuery.hasNextPage && !searchActorsQuery.isFetchingNextPage) {
          searchActorsQuery.fetchNextPage();
        }
        break;
      case 'posts':
        if (searchPostsQuery.hasNextPage && !searchPostsQuery.isFetchingNextPage) {
          searchPostsQuery.fetchNextPage();
        }
        break;
      case 'feeds':
        // Feeds don't have pagination in this implementation
        break;
    }
  };

  const handleRefresh = () => {
    switch (searchState.filters.type) {
      case 'users':
        searchActorsQuery.refetch();
        break;
      case 'posts':
        searchPostsQuery.refetch();
        break;
      case 'feeds':
        popularFeedsQuery.refetch();
        break;
    }
  };

  const handleLike = async (uri: string, cid: string, isLiked: boolean, likeUri?: string) => {
    try {
      if (isLiked && likeUri) {
        await unlikePostMutation.mutateAsync({ likeUri });
      } else {
        await likePostMutation.mutateAsync({ uri, cid });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleRepost = async (uri: string, cid: string, isReposted: boolean, repostUri?: string) => {
    try {
      if (isReposted && repostUri) {
        await deleteRepostMutation.mutateAsync({ repostUri });
      } else {
        await repostMutation.mutateAsync({ uri, cid });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update repost status');
    }
  };

  const handleComment = (uri: string) => {
    const safeUri = encodeURIComponent(uri);
    router.push(`/post/${safeUri}`);
  };

  const handleUserPress = (user: any) => {
    router.push(`/profile/${user.handle}`);
  };

  const handleFeedPress = (feed: any) => {
    // TODO: Navigate to feed view
    Alert.alert('Feed', `Opening feed: ${feed.displayName}`);
  };

  // Get current search data based on active filter
  const getCurrentSearchData = () => {
    switch (searchState.filters.type) {
      case 'users':
        return searchActorsQuery.data?.pages.flatMap(page => page.actors) || [];
      case 'posts':
        return searchPostsQuery.data?.pages.flatMap(page => page.posts) || [];
      case 'feeds':
        return popularFeedsQuery.data?.feeds || [];
      default:
        return [];
    }
  };

  const getCurrentLoading = () => {
    switch (searchState.filters.type) {
      case 'users':
        return searchActorsQuery.isLoading;
      case 'posts':
        return searchPostsQuery.isLoading;
      case 'feeds':
        return popularFeedsQuery.isLoading;
      default:
        return false;
    }
  };

  const getCurrentLoadingMore = () => {
    switch (searchState.filters.type) {
      case 'users':
        return searchActorsQuery.isFetchingNextPage;
      case 'posts':
        return searchPostsQuery.isFetchingNextPage;
      case 'feeds':
        return false;
      default:
        return false;
    }
  };

  // Calculate result counts for filter badges
  const resultCounts = useMemo(() => ({
    users: searchActorsQuery.data?.pages.flatMap(page => page.actors).length || 0,
    posts: searchPostsQuery.data?.pages.flatMap(page => page.posts).length || 0,
    feeds: popularFeedsQuery.data?.feeds.length || 0,
  }), [searchActorsQuery.data, searchPostsQuery.data, popularFeedsQuery.data]);

  const showSearchResults = searchState.hasSearched && debouncedQuery.trim().length > 0;
  const showTrending = !showSearchResults;

  return (
    <View style={styles.container}>
      <Header title="Search" />
      
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
          onUserPress={handleUserPress}
          onFeedPress={handleFeedPress}
          onSeeAllUsers={() => {
            setSearchState(prev => ({ 
              ...prev, 
              filters: { ...prev.filters, type: 'users' },
              hasSearched: true 
            }));
          }}
          onSeeAllFeeds={() => {
            setSearchState(prev => ({ 
              ...prev, 
              filters: { ...prev.filters, type: 'feeds' },
              hasSearched: true 
            }));
          }}
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
          onLike={(uri, cid) => {
            const post = getCurrentSearchData().find((p: any) => p.uri === uri);
            if (post) {
              handleLike(uri, cid, !!post.viewer?.like, post.viewer?.like);
            }
          }}
          onRepost={(uri, cid) => {
            const post = getCurrentSearchData().find((p: any) => p.uri === uri);
            if (post) {
              handleRepost(uri, cid, !!post.viewer?.repost, post.viewer?.repost);
            }
          }}
          onComment={handleComment}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});