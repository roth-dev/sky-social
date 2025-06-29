import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { Header } from '@/components/Header';
import { SearchHeader } from '@/components/search/SearchHeader';
import { UserSearchResult } from '@/components/search/UserSearchResult';
import { EmptyState, LoadingState } from '@/components/placeholders/EmptyState';
import { useSearchActors, useSuggestedFollows } from '@/lib/queries';
import { SearchActor } from '@/types/search';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function PeopleListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

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
    setSearchQuery('');
    setDebouncedQuery('');
  };

  const handleLoadMore = () => {
    if (searchActorsQuery.hasNextPage && !searchActorsQuery.isFetchingNextPage) {
      searchActorsQuery.fetchNextPage();
    }
  };

  const renderUserItem = ({ item }: { item: SearchActor }) => (
    <UserSearchResult user={item} />
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
      return searchActorsQuery.data?.pages.flatMap(page => page.actors) || [];
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
    <View style={styles.container}>
      <Header
        title="People"
        leftIcon={<ArrowLeft size={24} color="#111827" />}
        onLeftPress={() => router.back()}
      />
      
      <SearchHeader
        query={searchQuery}
        onQueryChange={handleQueryChange}
        onClear={handleClearSearch}
        placeholder="Search people..."
        autoFocus={false}
      />

      <FlatList
        data={data}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.did}
        style={styles.list}
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