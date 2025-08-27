import React, { useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { PostEmbed } from "@/types/embed";
import { ImageEmbed } from "./ImageEmbed";
import { ExternalEmbed } from "./ExternalEmbed";
import { RecordEmbed } from "./RecordEmbed";
import { VideoEmbed } from "./VideoEmbed";
import { RecordWithMediaEmbed } from "./RecordWithMediaEmbed";
import { AppBskyEmbedImages } from "@atproto/api";

interface EmbedContainerProps {
  embed: PostEmbed;
  isDetailView?: boolean;
  onImagePress?: (images: AppBskyEmbedImages.Image[], index: number) => void;
  onLinkPress?: (url: string) => void;
  onRecordPress?: (uri: string) => void;
  shouldPlay?: boolean;
}

export function EmbedContainer({
  embed,
  isDetailView = false,
  onLinkPress,
  onRecordPress,
  shouldPlay = false,
}: EmbedContainerProps) {
  const renderEmbed = useCallback(() => {
    switch (embed.$type) {
      case "app.bsky.embed.images#view":
        return (
          <ImageEmbed images={embed.images || []} isDetailView={isDetailView} />
        );

      case "app.bsky.embed.external#view":
        return (
          <ExternalEmbed
            external={embed.external}
            isDetailView={isDetailView}
            onLinkPress={onLinkPress}
          />
        );

      case "app.bsky.embed.record#view":
        return (
          <RecordEmbed
            record={embed.record}
            isDetailView={isDetailView}
            onRecordPress={onRecordPress}
          />
        );

      case "app.bsky.embed.video#view":
        return (
          <VideoEmbed
            video={embed}
            isDetailView={isDetailView}
            shouldPlay={shouldPlay}
          />
        );

      case "app.bsky.embed.recordWithMedia#view":
        return (
          <RecordWithMediaEmbed
            record={embed.record}
            media={embed.media}
            isDetailView={isDetailView}
            onRecordPress={onRecordPress}
            shouldPlay={shouldPlay}
          />
        );

      default:
        return null;
    }
  }, [embed, isDetailView, onRecordPress, onLinkPress, shouldPlay]);

  const embedContent = useMemo(() => renderEmbed(), [renderEmbed]);

  if (!embedContent) {
    return null;
  }

  return (
    <View style={[styles.container, isDetailView && styles.detailContainer]}>
      {embedContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  detailContainer: {
    marginTop: 16,
  },
});
