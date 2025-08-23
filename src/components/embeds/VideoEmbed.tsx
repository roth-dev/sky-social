import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { EmbedVideo } from "@/types/embed";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { Text, View } from "../ui";
import { isWeb } from "@/platform";

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
  // Handle different video URL formats
  const videoUrl = useMemo(() => {
    if (video?.playlist) {
      return video?.playlist;
    }
    if (typeof video === "string") {
      return video;
    }
    // If video has a cid, construct a URL (this might need adjustment based on AT Protocol)
    if (video?.cid) {
      return `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${video.cid}`;
    }
  }, [video]);

  if (!videoUrl) return null;

  return (
    <View
      style={[styles.container, isDetailView && styles.detailContainer]}
      darkColor="secondary"
    >
      <VideoPlayer
        uri={videoUrl}
        thumbnail={video?.thumbnail}
        aspectRatio={video?.aspectRatio}
        isDetailView={isDetailView}
        autoPlay={autoPlay}
        muted={muted}
        shouldPlay={shouldPlay}
        controls={isWeb}
      />

      {!!video?.alt && (
        <View className="py-3 px-2" darkColor="secondary">
          <Text size="sm" numberOfLines={2} className="opacity-50">
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
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
});
