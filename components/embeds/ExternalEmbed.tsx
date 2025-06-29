import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { EmbedExternal } from '@/types/embed';
import { ExternalLink } from 'lucide-react-native';

interface ExternalEmbedProps {
  external?: EmbedExternal;
  isDetailView?: boolean;
  onLinkPress?: (url: string) => void;
}

export function ExternalEmbed({ external, isDetailView = false, onLinkPress }: ExternalEmbedProps) {
  if (!external) {
    return null;
  }

  const handlePress = async () => {
    if (onLinkPress) {
      onLinkPress(external.uri);
    } else {
      try {
        await Linking.openURL(external.uri);
      } catch (error) {
        console.error('Failed to open URL:', error);
      }
    }
  };

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isDetailView && styles.detailContainer]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {external.thumb && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: external.thumb }}
            style={[styles.image, isDetailView && styles.detailImage]}
            resizeMode="cover"
          />
        </View>
      )}
      
      <View style={[styles.content, !external.thumb && styles.contentWithoutImage]}>
        <View style={styles.header}>
          <ExternalLink size={14} color="#6b7280" />
          <Text style={styles.domain} numberOfLines={1}>
            {getDomain(external.uri)}
          </Text>
        </View>
        
        <Text
          style={[styles.title, isDetailView && styles.detailTitle]}
          numberOfLines={isDetailView ? 3 : 2}
        >
          {external.title}
        </Text>
        
        {external.description && (
          <Text
            style={[styles.description, isDetailView && styles.detailDescription]}
            numberOfLines={isDetailView ? 4 : 2}
          >
            {external.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  detailContainer: {
    borderRadius: 16,
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailImage: {
    aspectRatio: 16 / 9,
  },
  content: {
    padding: 12,
  },
  contentWithoutImage: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  domain: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 4,
  },
  detailTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  detailDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});