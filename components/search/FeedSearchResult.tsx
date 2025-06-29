import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FeedGenerator } from '@/types/search';
import { Heart, Users } from 'lucide-react-native';

interface FeedSearchResultProps {
  feed: FeedGenerator;
  onPress?: () => void;
  onSubscribe?: () => void;
}

export function FeedSearchResult({ feed, onPress, onSubscribe }: FeedSearchResultProps) {
  const formatCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Avatar
        uri={feed.avatar}
        size="large"
        fallbackText={feed.displayName}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.feedInfo}>
            <Text style={styles.displayName} numberOfLines={1}>
              {feed.displayName}
            </Text>
            <Text style={styles.creator} numberOfLines={1}>
              by @{feed.creator.handle}
            </Text>
          </View>
          
          <Button
            title="Subscribe"
            variant="outline"
            size="small"
            onPress={onSubscribe}
            style={styles.subscribeButton}
          />
        </View>
        
        {feed.description && (
          <Text style={styles.description} numberOfLines={2}>
            {feed.description}
          </Text>
        )}
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Heart size={14} color="#6b7280" />
            <Text style={styles.statText}>
              {formatCount(feed.likeCount)} likes
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  feedInfo: {
    flex: 1,
    marginRight: 12,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  creator: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  subscribeButton: {
    paddingHorizontal: 16,
  },
});