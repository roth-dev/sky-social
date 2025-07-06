import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Post } from "@/components/Post";
import { EmptyState } from "@/components/placeholders/EmptyState";
import { ATFeedItem } from "@/types/atproto";
import { Heart } from "lucide-react-native";
import { Image } from "expo-image";
import TabList from "../tabs/List";

interface ProfileTabContentProps {
  tabKey: string;
  data: ATFeedItem[];
  loading?: boolean;
  loadingMore?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  paddingBottom?: number;
}

const { width } = Dimensions.get("window");
const MEDIA_ITEM_SIZE = (width - 48) / 3; // 3 columns with padding

export function ProfileTabContent({
  tabKey,
  data = [],
  loading = false,
  loadingMore = false,
  onRefresh,
  onLoadMore,
  paddingBottom = 0,
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
        <Image source={{ uri: images[0].thumb }} style={styles.mediaImage} />
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

  const renderLoadingFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <View style={styles.loadingSpinner} />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    // Show different empty states based on tab and loading state
    if (loading) return null;

    const emptyStateConfig = getEmptyStateConfig(tabKey);

    return (
      <EmptyState
        type={emptyStateConfig.type}
        title={emptyStateConfig.title}
        description={emptyStateConfig.description}
        style={styles.emptyState}
      />
    );
  };

  const getEmptyStateConfig = (key: string) => {
    switch (key) {
      case "posts":
        return {
          type: "posts" as const,
          title: "No posts yet",
          description: "When this user posts something, it will appear here.",
        };
      case "media":
        return {
          type: "media" as const,
          title: "No media yet",
          description:
            "When this user shares photos and videos, they will appear here.",
        };
      case "liked":
        return {
          type: "likes" as const,
          title: "No liked posts",
          description:
            "Liked posts may not be publicly available for this user.",
        };
      default:
        return {
          type: "posts" as const,
          title: "No content yet",
          description: "Content will appear here when available.",
        };
    }
  };

  const handleLoadMore = () => {
    if (onLoadMore && !loadingMore && !loading && data.length > 0) {
      onLoadMore();
    }
  };

  const getItemLayout = (tabKey: string) => {
    if (tabKey === "media") {
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
      case "posts":
        return renderPostItem(props);
      case "media":
        return renderMediaItem(props);
      case "liked":
        return renderLikedItem(props);
      default:
        return renderPostItem(props);
    }
  };

  // Filter out null items for media tab
  const filteredData =
    tabKey === "media"
      ? data.filter(
          (item) => item.post.embed?.images && item.post.embed.images.length > 0
        )
      : data;

  return (
    <TabList
      data={filteredData}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${tabKey}-${item.post.uri}-${index}`}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={loading}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderLoadingFooter}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      contentContainerStyle={{
        paddingBottom: paddingBottom,
      }}
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
  emptyContainer: {
    flex: 1,
  },
  mediaRow: {
    justifyContent: "space-between",
  },
  mediaItem: {
    width: MEDIA_ITEM_SIZE,
    height: MEDIA_ITEM_SIZE,
    marginBottom: 4,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e5e7eb",
  },
  multiImageIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  multiImageText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  likedItem: {
    marginBottom: 8,
  },
  likedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fef2f2",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#fecaca",
  },
  likedText: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#ffffff",
    gap: 8,
  },
  loadingSpinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderTopColor: "#3b82f6",
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
});
