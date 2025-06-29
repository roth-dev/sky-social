import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmbedVideo } from '@/types/embed';
import { VideoPlayer } from '@/components/video/VideoPlayer';

interface VideoEmbedProps {
  video?: EmbedVideo;
  isDetailView?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
}

export function VideoEmbed({ 
  video, 
  isDetailView = false,
  autoPlay = true,
  muted = true
}: VideoEmbedProps) {
  if (!video || !video.playlist) {
    return null;
  }

  return (
    <View style={[styles.container, isDetailView && styles.detailContainer]}>
      <VideoPlayer
        uri={video.playlist}
        thumbnail={video.thumbnail}
        aspectRatio={video.aspectRatio}
        isDetailView={isDetailView}
        autoPlay={autoPlay}
        muted={muted}
      />
      
      {video.alt && (
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
    overflow: 'hidden',
  },
  detailContainer: {
    borderRadius: 16,
  },
  altTextContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  altText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
});