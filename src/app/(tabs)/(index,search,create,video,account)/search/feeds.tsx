import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { Header } from '@/components/Header';
import { SearchHeader } from '@/components/search/SearchHeader';
import { FeedSearchResult } from '@/components/search/FeedSearchResult';
import { EmptyState, LoadingState } from '@/components/placeholders/EmptyState';
import { usePopularFeeds } from '@/lib/queries';
import { FeedGenerator } from '@/types/search';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function FeedsListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const popularFeedsQuery = usePopularFeeds();

  const handleQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleFeedPress = (feed: FeedGenerator) => {
    const safeFeedUri = encodeURIComponent(feed.uri);
    router.push(`/feed/${safeFeedUri}`);
  };

  const renderFeedItem = ({ item }: { item: FeedGenerator }) => (
    <FeedSearchResult
      feed={item}
      onPress={() => handleFeedPress(item)}
      onSubscribe={() => {
        // TODO: Implement feed subscription
        console.log('Subscribe to feed:', item.uri);
      }}
    />
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

  // Filter feeds based on search query
  const filteredFeeds = React.useMemo(() => {
    const feeds = popularFeedsQuery.data?.feeds || [];
    
    if (searchQuery.trim().length === 0) {
      return feeds;
    }
    
    const query = searchQuery.toLowerCase();
    return feeds.filter(feed => 
      feed.displayName.toLowerCase().includes(query) ||
      feed.description?.toLowerCase().includes(query) ||
      feed.creator.handle.toLowerCase().includes(query) ||
      feed.creator.displayName?.toLowerCase().includes(query)
    );
  }, [popularFeedsQuery.data?.feeds, searchQuery]);

  return (
    <View style={styles.container}>
      <Header
        title="Feeds"
        leftIcon={<ArrowLeft size={24} color="#111827" />}
        onLeftPress={() => router.back()}
      />
      
      <SearchHeader
        query={searchQuery}
        onQueryChange={handleQueryChange}
        onClear={handleClearSearch}
        placeholder="Search feeds..."
        autoFocus={false}
      />

      <FlatList
        data={filteredFeeds}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.uri}
        style={styles.list}
        contentContainerStyle={filteredFeeds.length === 0 ? styles.emptyContainer : undefined}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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