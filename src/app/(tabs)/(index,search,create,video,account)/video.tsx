import React, { useState, useCallback, useRef } from "react";
import { StyleSheet, Dimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVideoFeed } from "@/hooks/query/useVideoFeed";
import { EmptyState, LoadingState } from "@/components/placeholders/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { ATFeedItem } from "@/types/atproto";
import { View } from "@/components/ui";
import { List, ListRef } from "@/components/list";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoFeedOverlay } from "@/components/video/VideoFeedOverlay";
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

const { height: screenHeight } = Dimensions.get("window");

interface VideoFeedItemProps {
  item: ATFeedItem;
  index: number;
  isActive: boolean;
  height: number;
  onLike: (uri: string, cid: string) => void;
  onRepost: (uri: string, cid: string) => void;
  onShare: (uri: string) => void;
  onUserPress: (handle: string) => void;
}

function VideoFeedItem({
  item,
  isActive,
  height,
  onLike,
  onRepost,
  onShare,
  onUserPress,
}: VideoFeedItemProps) {
  const videoEmbed = item.post.embed;

  if (!videoEmbed) return null;

  return (
    <View
      style={[
        styles.videoContainer,
        {
          height,
        },
      ]}
    >
      <VideoPlayer
        uri={videoEmbed.playlist}
        thumbnail={videoEmbed.thumbnail}
        aspectRatio={videoEmbed.aspectRatio}
        shouldPlay={isActive}
        muted={false}
        contentFit="contain"
        containerStyle={{
          borderRadius: 0,
          height: undefined,
        }}
      />
      <VideoFeedOverlay
        post={item.post}
        onLike={() => onLike(item.post.uri, item.post.cid)}
        onRepost={() => onRepost(item.post.uri, item.post.cid)}
        onShare={() => onShare(item.post.uri)}
        onUserPress={() => onUserPress(item.post.author.handle)}
      />
    </View>
  );
}

export default function VideoScreen() {
  const { isAuthenticated } = useAuth();
  const videoFeedQuery = useVideoFeed();
  const listRef = useRef<ListRef>(null);

  const [seenItem, setSeenItem] = useState<ATFeedItem | undefined>(undefined);

  const height = useRef<number>(screenHeight);

  // Get video feed data
  const videoFeed = React.useMemo(() => {
    if (!videoFeedQuery.data) return [];

    return videoFeedQuery.data.pages.flatMap(
      (page) => page?.feed as FeedViewPost[]
    );
  }, [videoFeedQuery.data]);

  const onItemSeen = useCallback((item: ATFeedItem) => {
    setSeenItem(item);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (
      videoFeedQuery.hasNextPage &&
      !videoFeedQuery.isFetchingNextPage &&
      !videoFeedQuery.isLoading
    ) {
      videoFeedQuery.fetchNextPage();
    }
  }, [videoFeedQuery]);

  const handleLike = useCallback(
    (uri: string, cid: string) => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      // TODO: Implement like functionality
      console.log("Like video:", uri);
    },
    [isAuthenticated]
  );

  const handleRepost = useCallback(
    (uri: string, cid: string) => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      // TODO: Implement repost functionality
      console.log("Repost video:", uri);
    },
    [isAuthenticated]
  );

  const handleShare = useCallback(async (uri: string) => {
    try {
      const shareUrl = `https://bsky.app/profile/${uri.split("/")[2]}/post/${uri
        .split("/")
        .pop()}`;

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

  const renderVideoItem = useCallback(
    ({ item, index }: { item: ATFeedItem; index: number }) => (
      <VideoFeedItem
        item={item}
        index={index}
        height={height.current}
        isActive={item.post.embed?.cid === seenItem?.post.embed?.cid}
        onLike={handleLike}
        onRepost={handleRepost}
        onShare={handleShare}
        onUserPress={handleUserPress}
      />
    ),
    [seenItem, handleLike, handleRepost, handleShare, handleUserPress]
  );

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

  const renderLoadingState = useCallback(
    () => (
      <LoadingState message="Loading videos..." style={styles.emptyState} />
    ),
    []
  );

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
      <SafeAreaView style={styles.container}>{renderEmptyState()}</SafeAreaView>
    );
  }

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        height.current = e.nativeEvent.layout.height;
      }}
    >
      <List
        ref={listRef}
        data={videoFeed}
        renderItem={renderVideoItem}
        keyExtractor={(item, index) => `video-${item.post.uri}-${index}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onItemSeen={onItemSeen}
        onEndReachedThreshold={0.1}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        windowSize={6}
        initialNumToRender={3}
        getItemLayout={(_, index) => ({
          length: height.current,
          offset: height.current * index,
          index,
        })}
      />
    </View>
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
    width: "100%",
  },
  emptyState: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
