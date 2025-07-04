import React, { useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { PostEmbed } from "@/types/embed";
import { ImageEmbed } from "./ImageEmbed";
import { ExternalEmbed } from "./ExternalEmbed";
import { RecordEmbed } from "./RecordEmbed";
import { VideoEmbed } from "./VideoEmbed";
import { RecordWithMediaEmbed } from "./RecordWithMediaEmbed";

interface EmbedContainerProps {
  embed: PostEmbed;
  isDetailView?: boolean;
  onImagePress?: (images: any[], index: number) => void;
  onLinkPress?: (url: string) => void;
  onRecordPress?: (uri: string) => void;
}

export function EmbedContainer({
  embed,
  isDetailView = false,
  onImagePress,
  onLinkPress,
  onRecordPress,
}: EmbedContainerProps) {
  const renderEmbed = useCallback(() => {
    switch (embed.$type) {
      case "app.bsky.embed.images#view":
        return (
          <ImageEmbed
            images={embed.images || []}
            isDetailView={isDetailView}
            onImagePress={onImagePress}
          />
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
        return <VideoEmbed video={embed.video} isDetailView={isDetailView} />;

      case "app.bsky.embed.recordWithMedia#view":
        return (
          <RecordWithMediaEmbed
            record={embed.record}
            media={embed.media}
            isDetailView={isDetailView}
            onImagePress={onImagePress}
            onRecordPress={onRecordPress}
          />
        );

      default:
        return null;
    }
  }, [embed, isDetailView, onImagePress, onRecordPress, onLinkPress]);

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
