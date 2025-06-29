import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { EmbedVideo } from '@/types/embed';
import { Play, Volume2 } from 'lucide-react-native';

interface VideoEmbedProps {
  video?: EmbedVideo;
  isDetailView?: boolean;
}

export function VideoEmbed({ video, isDetailView = false }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!video) {
    return null;
  }

  const handlePlayPress = () => {
    // For now, show an alert since video playback requires additional setup
    Alert.alert(
      'Video Playback',
      'Video playback will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const aspectRatio = video.aspectRatio ? 
    video.aspectRatio.width / video.aspectRatio.height : 16 / 9;

  return (
    <View style={[styles.container, isDetailView && styles.detailContainer]}>
      <TouchableOpacity
        style={[
          styles.videoContainer,
          { aspectRatio },
          isDetailView && styles.detailVideoContainer
        ]}
        onPress={handlePlayPress}
        activeOpacity={0.9}
      >
        {video.thumbnail && (
          <Image
            source={{ uri: video.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.overlay}>
          <View style={styles.playButton}>
            <Play size={isDetailView ? 32 : 24} color="#ffffff" fill="#ffffff" />
          </View>
        </View>
        
        <View style={styles.videoInfo}>
          <View style={styles.videoIndicator}>
            <Volume2 size={12} color="#ffffff" />
            <Text style={styles.videoLabel}>Video</Text>
          </View>
        </View>
      </TouchableOpacity>
      
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
    backgroundColor: '#000000',
  },
  detailContainer: {
    borderRadius: 16,
  },
  videoContainer: {
    position: 'relative',
    backgroundColor: '#000000',
    minHeight: 200,
  },
  detailVideoContainer: {
    minHeight: 300,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  videoInfo: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  videoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  videoLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  altTextContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
  },
  altText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
});