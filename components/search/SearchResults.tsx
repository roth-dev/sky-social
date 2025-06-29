import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { UserSearchResult } from './UserSearchResult';
import { PostSearchResult } from './PostSearchResult';
import { FeedSearchResult } from './FeedSearchResult';
import { EmptyState, LoadingState } from '@/components/placeholders/EmptyState';
import { SearchFilters, SearchResultType } from '@/types/search';
import { SearchActor, FeedGenerator } from '@/types/search';
import { ATPost } from '@/types/atproto';

interface SearchResultsProps {
  type: SearchResultType;
  data: any[];
  loading: boolean;
  loadingMore: boolean;
  hasSearched: boolean;
  query: string;
  onLoadMore: () => void;
  onRefresh: () => void;
  onLike?: (uri: string, cid: string) => void;
  onRepost?: (uri: string, cid: string) => void;
  onComment?: (uri: string) => void;
}

export function SearchResults({
  type,
  data,
  loading,
  loadingMore,
  hasSearched,
  query,
  onLoadMore,
  onRefresh,
  onLike,
  onRepost,
  onComment,
}: SearchResultsProps) {
  const renderUserItem = ({ item }: { item: SearchActor }) => (
    <UserSearchResult user={item} />
  );

  const renderPostItem = ({ item }: { item: ATPost }) => (
    <PostSearchResult
      post={item}
      onLike={onLike}
      onRepost={onRepost}
      onComment={onComment}
    />
  );

  const renderFeedItem = ({ item }: { item: FeedGenerator }) => (
    <FeedSearchResult
      feed={item}
      onSubscribe={() => {
        // TODO: Implement feed subscription
        console.log('Subscribe to feed:', item.uri);
      }}
    />
  );

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
          message={`Searching for ${type}...`}
          style={styles.emptyState}
        />
      );
    }

    if (!hasSearched) {
      return (
        <EmptyState
          type="search"
          title="Start searching"
          description="Enter a search term to find people, posts, and feeds on Bluesky."
          style={styles.emptyState}
        />
      );
    }

    if (query.trim().length === 0) {
      return (
        <EmptyState
          type="search"
          title="Enter a search term"
          description="Type something to search for people, posts, and feeds."
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

  const getEmptyStateConfig = (searchType: SearchResultType, searchQuery: string) => {
    switch (searchType) {
      case 'users':
        return {
          title: 'No people found',
          description: `No users found for "${searchQuery}". Try searching with a different term or handle.`,
        };
      case 'posts':
        return {
          title: 'No posts found',
          description: `No posts found for "${searchQuery}". Try searching with different keywords.`,
        };
      case 'feeds':
        return {
          title: 'No feeds found',
          description: `No custom feeds found for "${searchQuery}". Try browsing popular feeds instead.`,
        };
      default:
        return {
          title: 'No results found',
          description: `No results found for "${searchQuery}". Try a different search term.`,
        };
    }
  };

  const getRenderItem = () => {
    switch (type) {
      case 'users':
        return renderUserItem;
      case 'posts':
        return renderPostItem;
      case 'feeds':
        return renderFeedItem;
      default:
        return renderUserItem;
    }
  };

  const getKeyExtractor = (item: any, index: number) => {
    switch (type) {
      case 'users':
        return item.did || `user-${index}`;
      case 'posts':
        return item.uri || `post-${index}`;
      case 'feeds':
        return item.uri || `feed-${index}`;
      default:
        return `item-${index}`;
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && !loading && data.length > 0) {
      onLoadMore();
    }
  };

  return (
    <FlatList
      data={data}
      renderItem={getRenderItem()}
      keyExtractor={getKeyExtractor}
      style={styles.container}
      contentContainerStyle={data.length === 0 ? styles.emptyContainer : undefined}
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
    backgroundColor: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  loadingSpinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderTopColor: '#3b82f6',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});