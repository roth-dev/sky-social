import React, { useState, useCallback, useRef, useEffect } from "react";
import { StyleSheet, Dimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVideoFeed } from "@/lib/queries";
import { VideoFeedPlayer } from "@/components/video/VideoFeedPlayer";
import { VideoFeedOverlay } from "../../components/video/VideoFeedOverlay";
import { EmptyState, LoadingState } from "@/components/placeholders/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { ATFeedItem } from "@/types/atproto";
import { View,Text } from "@/components/ui";
import { List } from "@/components/list";
import { isVideoPost } from "@/utils/embedUtils";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

interface VideoFeedItemProps {
  item: ATFeedItem;
  index: number;
  isActive: boolean;
  onLike: (uri: string, cid: string) => void;
  onRepost: (uri: string, cid: string) => void;
  onComment: (uri: string) => void;
  onShare: (uri: string) => void;
  onUserPress: (handle: string) => void;
}

function VideoFeedItem({
  item,
  index,
  isActive,
  onLike,
  onRepost,
  onComment,
  onShare,
  onUserPress,
}: VideoFeedItemProps) {
  const videoEmbed = item.post.embed?.video || item.post.embed?.media?.video;
  
  if (!videoEmbed) return null;

  return (
    <View style={styles.videoContainer}>
      <VideoFeedPlayer
        uri={videoEmbed.playlist}
        thumbnail={videoEmbed.thumbnail}
        aspectRatio={videoEmbed.aspectRatio}
        isActive={isActive}
        autoPlay={isActive}
        muted={true}
      />
      
      <VideoFeedOverlay
        post={item.post}
        onLike={() => onLike(item.post.uri, item.post.cid)}
        onRepost={() => onRepost(item.post.uri, item.post.cid)}
        onComment={() => onComment(item.post.uri)}
        onShare={() => onShare(item.post.uri)}
        onUserPress={() => onUserPress(item.post.author.handle)}
      />
    </View>
  );
}

export default function VideoScreen() {
  const { isAuthenticated } = useAuth();
  const videoFeedQuery = useVideoFeed();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<any>(null);

  // Filter for video posts only
  const videoFeed = React.useMemo(() => {
    if (!videoFeedQuery.data) return [];
    
    return videoFeedQuery.data.pages.flatMap((page) =>
      page?.feed.filter((item) => isVideoPost(item.post)) || []
    );
  }, [videoFeedQuery.data]);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const visibleIndex = viewableItems[0].index;
      setCurrentIndex(visibleIndex);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 300,
  };

  const handleLoadMore = useCallback(() => {
    if (
      videoFeedQuery.hasNextPage &&
      !videoFeedQuery.isFetchingNextPage &&
      !videoFeedQuery.isLoading
    ) {
      videoFeedQuery.fetchNextPage();
    }
  }, [videoFeedQuery]);

  const handleLike = useCallback((uri: string, cid: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // TODO: Implement like functionality
    console.log("Like video:", uri);
  }, [isAuthenticated]);

  const handleRepost = useCallback((uri: string, cid: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // TODO: Implement repost functionality
    console.log("Repost video:", uri);
  }, [isAuthenticated]);

  const handleComment = useCallback((uri: string) => {
    const safeUri = encodeURIComponent(uri);
    router.push(`/post/${safeUri}`);
  }, []);

  const handleShare = useCallback(async (uri: string) => {
    try {
      const shareUrl = `https://bsky.app/profile/${uri.split("/")[2]}/post/${uri.split("/").pop()}`;
      
      if (Platform.OS === "web") {
        if (navigator.share) {
          await navigator.share({
            title: "Check out this video on Sky Social",
            url: shareUrl,
          });
        } else {
          await navigator.clipboard.writeText(shareUrl);
          // Could show a toast notification here
        }
      }
    } catch (error) {
      console.error("Failed to share video:", error);
    }
  }, []);

  const handleUserPress = useCallback((handle: string) => {
    router.push(`/profile/${handle}`);
  }, []);

  const renderVideoItem = useCallback(({ item, index }: { item: ATFeedItem; index: number }) => (
    <VideoFeedItem
      item={item}
      index={index}
      isActive={index === currentIndex}
      onLike={handleLike}
      onRepost={handleRepost}
      onComment={handleComment}
      onShare={handleShare}
      onUserPress={handleUserPress}
    />
  ), [currentIndex, handleLike, handleRepost, handleComment, handleShare, handleUserPress]);

  const renderEmptyState = useCallback(() => {
    if (!isAuthenticated) {
      return (
        <EmptyState
          type="media"
          title="Sign in to watch videos"
          description="Join Sky Social to discover amazing video content from the community."
          style={styles.emptyState}
        />
      );
    }

    return (
      <EmptyState
        type="media"
        title="No videos found"
        description="Videos will appear here when users share video content. Try refreshing or check back later."
        style={styles.emptyState}
      />
    );
  }, [isAuthenticated]);

  const renderLoadingState = useCallback(() => (
    <LoadingState
      message="Loading videos..."
      style={styles.emptyState}
    />
  ), []);

  // Show loading state on initial load
  if (videoFeedQuery.isLoading && videoFeed.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  // Show empty state if no videos
  if (videoFeed.length === 0 && !videoFeedQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text></Text>
      <List
        ref={listRef}
        data={videoFeed}
        renderItem={renderVideoItem}
        keyExtractor={(item, index) => `video-${item.post.uri}-${index}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        getItemLayout={(data, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  list: {
    flex: 1,
  },
  videoContainer: {
    height: screenHeight,
    width: screenWidth,
    position: "relative",
    backgroundColor: "#000000",
  },
  emptyState: {
    flex: 1,
    backgroundColor: "#000000",
  },
});