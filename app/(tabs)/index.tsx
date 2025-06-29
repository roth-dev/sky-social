import React from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl } from 'react-native';
import { Header } from '@/components/Header';
import { Post } from '@/components/Post';
import { FeedPlaceholder } from '@/components/placeholders/FeedPlaceholder';
import { EmptyState, ErrorState } from '@/components/placeholders/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useTimeline, useLikePost, useUnlikePost, useRepost, useDeleteRepost } from '@/lib/queries';
import { ATFeedItem } from '@/types/atproto';
import { Camera, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();
  const timelineQuery = useTimeline();
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const repostMutation = useRepost();
  const deleteRepostMutation = useDeleteRepost();

  const handleLike = async (uri: string, cid: string, isLiked: boolean, likeUri?: string) => {
    if (isLiked && likeUri) {
      unlikePostMutation.mutate({ likeUri });
    } else {
      likePostMutation.mutate({ uri, cid });
    }
  };

  const handleRepost = async (uri: string, cid: string, isReposted: boolean, repostUri?: string) => {
    if (isReposted && repostUri) {
      deleteRepostMutation.mutate({ repostUri });
    } else {
      repostMutation.mutate({ uri, cid });
    }
  };

  const handleComment = (uri: string) => {
    const safeUri = encodeURIComponent(uri);
    router.push(`/post/${safeUri}`);
  };

  const renderItem = ({ item }: { item: ATFeedItem }) => (
    <Post
      post={item.post}
      onLike={(uri, cid) => handleLike(uri, cid, !!item.post.viewer?.like, item.post.viewer?.like)}
      onRepost={(uri, cid) => handleRepost(uri, cid, !!item.post.viewer?.repost, item.post.viewer?.repost)}
      onComment={handleComment}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      type="timeline"
      title="Welcome to SocialSky!"
      description={
        isAuthenticated 
          ? "Your timeline will appear here once you follow some people and they start posting."
          : "Please log in to see your personalized timeline and connect with the decentralized social web."
      }
    />
  );

  const renderError = () => (
    <ErrorState
      title="Unable to load timeline"
      description={timelineQuery.error?.message || 'Something went wrong while loading your timeline. Please try again.'}
      onRetry={() => timelineQuery.refetch()}
    />
  );

  const renderLoadingFooter = () => {
    if (!timelineQuery.isFetchingNextPage) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more posts...</Text>
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header title="SocialSky" />
        <EmptyState
          type="timeline"
          title="Welcome to SocialSky!"
          description="Please log in to view your timeline and connect with the decentralized social web."
        />
      </View>
    );
  }

  // Show loading placeholder on initial load
  if (timelineQuery.isLoading) {
    return (
      <View style={styles.container}>
        <Header
          title="SocialSky"
          leftIcon={<Camera size={24} color="#111827" />}
          rightIcon={<Sparkles size={24} color="#111827" />}
        />
        <FeedPlaceholder count={6} showVariety={true} />
      </View>
    );
  }

  // Show error state
  if (timelineQuery.error) {
    return (
      <View style={styles.container}>
        <Header
          title="SocialSky"
          leftIcon={<Camera size={24} color="#111827" />}
          rightIcon={<Sparkles size={24} color="#111827" />}
        />
        {renderError()}
      </View>
    );
  }

  const allPosts = timelineQuery.data?.pages.flatMap(page => page.feed) || [];

  return (
    <View style={styles.container}>
      <Header
        title="SocialSky"
        leftIcon={<Camera size={24} color="#111827" />}
        rightIcon={<Sparkles size={24} color="#111827" />}
      />
      
      <FlatList
        data={allPosts}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.post.uri}-${index}`}
        style={styles.feed}
        refreshControl={
          <RefreshControl
            refreshing={timelineQuery.isFetching && !timelineQuery.isLoading}
            onRefresh={() => timelineQuery.refetch()}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
        onEndReached={() => {
          if (timelineQuery.hasNextPage && !timelineQuery.isFetchingNextPage) {
            timelineQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoadingFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={allPosts.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  feed: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});