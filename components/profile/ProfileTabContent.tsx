import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Post } from '@/components/Post';
import { ATFeedItem } from '@/types/atproto';
import { Play, Heart } from 'lucide-react-native';

interface ProfileTabContentProps {
  tabKey: string;
  data: ATFeedItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
}

const { width } = Dimensions.get('window');
const MEDIA_ITEM_SIZE = (width - 48) / 3; // 3 columns with padding

export function ProfileTabContent({ 
  tabKey, 
  data = [], 
  loading = false,
  onRefresh,
  onLoadMore 
}: ProfileTabContentProps) {
  const renderPostItem = ({ item }: { item: ATFeedItem }) => (
    <Post
      post={item.post}
      onLike={() => {}}
      onRepost={() => {}}
      onComment={() => {}}
    />
  );

  const renderMediaItem = ({ item }: { item: ATFeedItem }) => {
    const images = item.post.embed?.images;
    if (!images || images.length === 0) return null;

    return (
      <TouchableOpacity style={styles.mediaItem}>
        <Image 
          source={{ uri: images[0].thumb }}
          style={styles.mediaImage}
        />
        {images.length > 1 && (
          <View style={styles.multiImageIndicator}>
            <Text style={styles.multiImageText}>+{images.length - 1}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderLikedItem = ({ item }: { item: ATFeedItem }) => (
    <View style={styles.likedItem}>
      <Post
        post={item.post}
        onLike={() => {}}
        onRepost={() => {}}
        onComment={() => {}}
      />
      <View style={styles.likedIndicator}>
        <Heart size={16} color="#ef4444" fill="#ef4444" />
        <Text style={styles.likedText}>You liked this</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {getEmptyStateTitle(tabKey)}
      </Text>
      <Text style={styles.emptyStateDescription}>
        {getEmptyStateDescription(tabKey)}
      </Text>
    </View>
  );

  const getEmptyStateTitle = (key: string) => {
    switch (key) {
      case 'posts': return 'No posts yet';
      case 'media': return 'No media yet';
      case 'liked': return 'No liked posts yet';
      default: return 'No content yet';
    }
  };

  const getEmptyStateDescription = (key: string) => {
    switch (key) {
      case 'posts': return 'When this user posts something, it will appear here.';
      case 'media': return 'When this user shares photos and videos, they will appear here.';
      case 'liked': return 'When this user likes posts, they will appear here.';
      default: return 'Content will appear here when available.';
    }
  };

  const getItemLayout = (tabKey: string) => {
    if (tabKey === 'media') {
      return {
        numColumns: 3,
        getItemLayout: (_: any, index: number) => ({
          length: MEDIA_ITEM_SIZE,
          offset: MEDIA_ITEM_SIZE * Math.floor(index / 3),
          index,
        }),
      };
    }
    return { numColumns: 1 };
  };

  const renderItem = (props: any) => {
    switch (tabKey) {
      case 'posts': return renderPostItem(props);
      case 'media': return renderMediaItem(props);
      case 'liked': return renderLikedItem(props);
      default: return renderPostItem(props);
    }
  };

  const { numColumns } = getItemLayout(tabKey);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${tabKey}-${item.post.uri}-${index}`}
      numColumns={numColumns}
      contentContainerStyle={[
        styles.container,
        tabKey === 'media' && styles.mediaContainer,
      ]}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={loading}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={renderEmptyState}
      columnWrapperStyle={tabKey === 'media' ? styles.mediaRow : undefined}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  mediaContainer: {
    paddingHorizontal: 16,
  },
  mediaRow: {
    justifyContent: 'space-between',
  },
  mediaItem: {
    width: MEDIA_ITEM_SIZE,
    height: MEDIA_ITEM_SIZE,
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  multiImageIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  multiImageText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  likedItem: {
    marginBottom: 8,
  },
  likedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fef2f2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#fecaca',
  },
  likedText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});