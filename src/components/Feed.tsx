import React from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Post } from './Post';
import { ATFeedItem } from '@/types/atproto';

interface FeedProps {
  data: ATFeedItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onLike?: (uri: string, cid: string) => void;
  onRepost?: (uri: string, cid: string) => void;
  onComment?: (uri: string) => void;
}

export function Feed({
  data,
  loading = false,
  onRefresh,
  onLoadMore,
  onLike,
  onRepost,
  onComment,
}: FeedProps) {
  const renderItem = ({ item }: { item: ATFeedItem }) => (
    <Post
      post={item.post}
      onLike={onLike}
      onRepost={onRepost}
      onComment={onComment}
    />
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.post.uri}
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});