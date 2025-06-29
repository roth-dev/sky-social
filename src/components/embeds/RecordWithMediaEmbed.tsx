import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EmbedRecord, EmbedImage, EmbedVideo } from '@/types/embed';
import { RecordEmbed } from './RecordEmbed';
import { ImageEmbed } from './ImageEmbed';
import { VideoEmbed } from './VideoEmbed';

interface RecordWithMediaEmbedProps {
  record?: EmbedRecord;
  media?: {
    images?: EmbedImage[];
    video?: EmbedVideo;
  };
  isDetailView?: boolean;
  onImagePress?: (images: EmbedImage[], index: number) => void;
  onRecordPress?: (uri: string) => void;
}

export function RecordWithMediaEmbed({
  record,
  media,
  isDetailView = false,
  onImagePress,
  onRecordPress,
}: RecordWithMediaEmbedProps) {
  if (!record && !media) {
    return null;
  }

  return (
    <View style={[styles.container, isDetailView && styles.detailContainer]}>
      {record && (
        <RecordEmbed
          record={record}
          isDetailView={isDetailView}
          onRecordPress={onRecordPress}
        />
      )}
      
      {media && (
        <View style={[styles.mediaContainer, record && styles.mediaWithRecord]}>
          {media.images && media.images.length > 0 && (
            <ImageEmbed
              images={media.images}
              isDetailView={isDetailView}
              onImagePress={onImagePress}
            />
          )}
          
          {media.video && (
            <VideoEmbed
              video={media.video}
              isDetailView={isDetailView}
            />
          )}
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
  mediaContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaWithRecord: {
    marginTop: 8,
  },
});