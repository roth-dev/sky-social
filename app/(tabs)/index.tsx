import React from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl } from 'react-native';
import { Header } from '@/components/Header';
import { Post } from '@/components/Post';
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
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Welcome to SocialSky!</Text>
      <Text style={styles.emptyStateDescription}>
        {isAuthenticated 
          ? "Your timeline will appear here once you follow some people."
          : "Please log in to see your personalized timeline."
        }
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorTitle}>Unable to load timeline</Text>
      <Text style={styles.errorDescription}>
        {timelineQuery.error?.message || 'Something went wrong. Please try again.'}
      </Text>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header title="SocialSky" />
        <View style={styles.notAuthenticatedContainer}>
          <Text style={styles.notAuthenticatedText}>
            Please log in to view your timeline
          </Text>
        </View>
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
      
      {timelineQuery.error ? (
        renderError()
      ) : (
        <FlatList
          data={allPosts}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.post.uri}-${index}`}
          style={styles.feed}
          refreshControl={
            <RefreshControl
              refreshing={timelineQuery.isFetching && !timelineQuery.isLoading}
              onRefresh={() => timelineQuery.refetch()}
            />
          }
          onEndReached={() => {
            if (timelineQuery.hasNextPage && !timelineQuery.isFetchingNextPage) {
              timelineQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={timelineQuery.isLoading ? null : renderEmptyState}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            timelineQuery.isFetchingNextPage ? (
              <View style={styles.loadingFooter}>
                <Text style={styles.loadingText}>Loading more posts...</Text>
              </View>
            ) : null
          }
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
  feed: {
    flex: 1,
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
});