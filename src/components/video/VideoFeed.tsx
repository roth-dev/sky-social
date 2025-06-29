import React, { useState, useCallback } from 'react';
import { FlatList, View, StyleSheet, RefreshControl, Text } from 'react-native';
import { Post } from '@/components/Post';
import { EmptyState } from '@/components/placeholders/EmptyState';
import { ATFeedItem } from '@/types/atproto';
import { isVideoPost } from '@/utils/embedUtils';

interface VideoFeedProps {
  data: ATFeedItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onLike?: (uri: string, cid: string) => void;
  onRepost?: (uri: string, cid: string) => void;
  onComment?: (uri: string) => void;
}

export function VideoFeed({
  data,
  loading = false,
  onRefresh,
  onLoadMore,
  onLike,
  onRepost,
  onComment,
}: VideoFeedProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Filter posts that have video content
  const videoFeedData = data.filter(item => isVideoPost(item.post));

  const renderItem = useCallback(({ item, index }: { item: ATFeedItem; index: number }) => (
    <View style={styles.videoItem}>
      <Post
        post={item.post}
        onLike={onLike}
        onRepost={onRepost}
        onComment={onComment}
        isDetailView={false}
      />
    </View>
  ), [onLike, onRepost, onComment]);

  const renderLoadingFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <View style={styles.loadingSpinner} />
        <Text style={styles.loadingText}>Loading more videos...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      type="media"
      title="No videos found"
      description="Videos will appear here when users share video content."
      style={styles.emptyState}
    />
  );

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const visibleIndex = viewableItems[0].index;
      setCurrentVideoIndex(visibleIndex);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  };

  const handleLoadMore = () => {
    if (onLoadMore && !loading && videoFeedData.length > 0) {
      onLoadMore();
    }
  };

  return (
    <FlatList
      data={videoFeedData}
      renderItem={renderItem}
      keyExtractor={(item, index) => `video-${item.post.uri}-${index}`}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          tintColor="#3b82f6"
          colors={['#3b82f6']}
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderLoadingFooter}
      removeClippedSubviews={true}
      maxToRenderPerBatch={3}
      windowSize={5}
      initialNumToRender={2}
      getItemLayout={(data, index) => ({
        length: 600, // Approximate item height
        offset: 600 * index,
        index,
      })}
      contentContainerStyle={videoFeedData.length === 0 ? styles.emptyContainer : undefined}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  videoItem: {
    marginBottom: 1,
    backgroundColor: '#ffffff',
  },
  emptyState: {
    flex: 1,
  },
  emptyContainer: {
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