import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { EmbedVideo } from "@/types/embed";
import { VideoPlayer } from "@/components/video/VideoPlayer";

interface VideoEmbedProps {
  video?: EmbedVideo;
  isDetailView?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  shouldPlay?: boolean;
}

export function VideoEmbed({
  video,
  isDetailView = false,
  autoPlay = true,
  muted = true,
  shouldPlay = false,
}: VideoEmbedProps) {
  if (!video) {
    return null;
  }

  // Handle different video URL formats
  const getVideoUrl = () => {
    if (video.playlist) {
      return video.playlist;
    }

    // Fallback to other possible video URL properties
    if (typeof video === "string") {
      return video;
    }

    // If video has a cid, construct a URL (this might need adjustment based on AT Protocol)
    if (video.cid) {
      return `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${video.cid}`;
    }

    return null;
  };

  const videoUrl = getVideoUrl();

  if (!videoUrl) {
    // Show a placeholder if video URL is not available
    return (
      <View style={[styles.container, isDetailView && styles.detailContainer]}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Video not available</Text>
        </View>
        {!!video.alt && (
          <View style={styles.altTextContainer}>
            <Text style={styles.altText} numberOfLines={2}>
              {video.alt}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, isDetailView && styles.detailContainer]}>
      <VideoPlayer
        uri={videoUrl}
        thumbnail={video.thumbnail}
        aspectRatio={video.aspectRatio}
        isDetailView={isDetailView}
        autoPlay={autoPlay}
        muted={muted}
        shouldPlay={shouldPlay}
      />

      {!!video.alt && (
        <View style={styles.altTextContainer}>
          <Text style={styles.altText} numberOfLines={2}>
            {video.alt}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
  },
  detailContainer: {
    borderRadius: 16,
  },
  placeholderContainer: {
    height: 200,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  altTextContainer: {
    padding: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
  },
  altText: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
});
