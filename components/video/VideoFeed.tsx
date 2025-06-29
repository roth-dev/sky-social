import React, { useState, useCallback } from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { Post } from '@/components/Post';
import { ATFeedItem } from '@/types/atproto';

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
  const videoFeedData = data.filter(item => 
    item.post.embed?.video || 
    item.post.embed?.media?.video ||
    item.post.embed?.$type === 'app.bsky.embed.video#view'
  );

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
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      removeClippedSubviews={true}
      maxToRenderPerBatch={3}
      windowSize={5}
      initialNumToRender={2}
      getItemLayout={(data, index) => ({
        length: 600, // Approximate item height
        offset: 600 * index,
        index,
      })}
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
});