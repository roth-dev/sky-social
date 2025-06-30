import React from "react";
import {
  View,
  FlatList,
  Text,
  RefreshControl,
  Platform,
} from "react-native";
import { Header } from "@/components/Header";
import { Post } from "@/components/Post";
import { FeedPlaceholder } from "@/components/placeholders/FeedPlaceholder";
import { EmptyState, ErrorState } from "@/components/placeholders/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import {
  useTimeline,
  useLikePost,
  useUnlikePost,
  useRepost,
  useDeleteRepost,
} from "@/lib/queries";
import { ATFeedItem } from "@/types/atproto";
import { Camera, Sparkles } from "lucide-react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();
  const timelineQuery = useTimeline();
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const repostMutation = useRepost();
  const deleteRepostMutation = useDeleteRepost();

  const handleLike = async (
    uri: string,
    cid: string,
    isLiked: boolean,
    likeUri?: string
  ) => {
    if (!isAuthenticated) {
      // For unauthenticated users, show a prompt to sign in
      router.push("/profile");
      return;
    }

    if (isLiked && likeUri) {
      unlikePostMutation.mutate({ likeUri });
    } else {
      likePostMutation.mutate({ uri, cid });
    }
  };

  const handleRepost = async (
    uri: string,
    cid: string,
    isReposted: boolean,
    repostUri?: string
  ) => {
    if (!isAuthenticated) {
      // For unauthenticated users, show a prompt to sign in
      router.push("/profile");
      return;
    }

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

  const handleLoadMore = () => {
    if (
      timelineQuery.hasNextPage &&
      !timelineQuery.isFetchingNextPage &&
      !timelineQuery.isLoading
    ) {
      timelineQuery.fetchNextPage();
    }
  };

  const renderItem = ({ item }: { item: ATFeedItem }) => (
    <Post
      post={item.post}
      onLike={(uri, cid) =>
        handleLike(uri, cid, !!item.post.viewer?.like, item.post.viewer?.like)
      }
      onRepost={(uri, cid) =>
        handleRepost(
          uri,
          cid,
          !!item.post.viewer?.repost,
          item.post.viewer?.repost
        )
      }
      onComment={handleComment}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      type="timeline"
      title="Welcome to Sky Social!"
      description={
        isAuthenticated
          ? "Discover posts from the decentralized social web. Follow people to see their posts in your timeline."
          : "Discover posts from the decentralized social web. Sign in to interact with posts and see your personalized timeline."
      }
    />
  );

  const renderError = () => (
    <ErrorState
      title="Unable to load timeline"
      description={
        timelineQuery.error?.message ||
        "Something went wrong while loading the timeline. Please try again."
      }
      onRetry={() => timelineQuery.refetch()}
    />
  );

  const renderLoadingFooter = () => {
    if (!timelineQuery.isFetchingNextPage) return null;

    return (
      <View className="py-5 items-center bg-white gap-2">
        <View className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-blue-500" />
        <Text className="text-sm text-gray-500 font-medium">Loading more posts...</Text>
      </View>
    );
  };

  // Show loading placeholder on initial load
  if (timelineQuery.isLoading) {
    return (
      <View className="flex-1 bg-white">
        {Platform.OS !== "web" && (
          <Header
            title="Sky Social"
            leftIcon={<Camera size={24} color="#111827" />}
            rightIcon={<Sparkles size={24} color="#111827" />}
          />
        )}
        <FeedPlaceholder count={6} showVariety={true} includeVideos={true} />
      </View>
    );
  }

  // Show error state
  if (timelineQuery.error) {
    return (
      <View className="flex-1 bg-white">
        {Platform.OS !== "web" && (
          <Header
            title="Sky Social"
            leftIcon={<Camera size={24} color="#111827" />}
            rightIcon={<Sparkles size={24} color="#111827" />}
          />
        )}
        {renderError()}
      </View>
    );
  }

  const allPosts =
    timelineQuery.data?.pages.flatMap((page) => page?.feed) || [];

  return (
    <View className="flex-1 bg-white">
      {Platform.OS !== "web" && (
        <Header
          title="Sky Social"
          leftIcon={<Camera size={24} color="#111827" />}
          rightIcon={<Sparkles size={24} color="#111827" />}
        />
      )}

      <FlatList
        data={allPosts}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.post.uri}-${index}`}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={timelineQuery.isFetching && !timelineQuery.isLoading}
            onRefresh={() => timelineQuery.refetch()}
            tintColor="#3b82f6"
            colors={["#3b82f6"]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoadingFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          allPosts.length === 0 ? { flex: 1 } : undefined
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />
    </View>
  );
}