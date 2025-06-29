import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Header } from '@/components/Header';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState, LoadingState, ErrorState } from '@/components/placeholders/EmptyState';
import { ArrowLeft, Heart, Users, Calendar, ExternalLink, Share } from 'lucide-react-native';
import { Platform, Linking } from 'react-native';

// Mock feed data - In a real app, this would come from the AT Protocol API
interface FeedDetails {
  uri: string;
  cid: string;
  did: string;
  creator: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  displayName: string;
  description?: string;
  avatar?: string;
  banner?: string;
  likeCount?: number;
  subscriberCount?: number;
  indexedAt: string;
  isSubscribed?: boolean;
}

export default function FeedDetailScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const decodedUri = uri ? decodeURIComponent(uri) : '';

  // Mock feed data - In a real implementation, this would be fetched from the API
  const [feedData, setFeedData] = useState<FeedDetails | null>(null);

  React.useEffect(() => {
    // Simulate API call
    const loadFeedData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock feed data based on URI
        const mockFeed: FeedDetails = {
          uri: decodedUri,
          cid: 'mock-cid',
          did: 'did:plc:mock-creator',
          creator: {
            did: 'did:plc:mock-creator',
            handle: 'feedcreator.bsky.social',
            displayName: 'Feed Creator',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
          displayName: 'Discover Photography',
          description: 'A curated feed showcasing the best photography from the Bluesky community. Featuring landscape, portrait, street photography, and more.',
          avatar: 'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=400',
          banner: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800',
          likeCount: 1247,
          subscriberCount: 8934,
          indexedAt: new Date().toISOString(),
          isSubscribed: false,
        };
        
        setFeedData(mockFeed);
        setIsSubscribed(mockFeed.isSubscribed || false);
      } catch (err) {
        setError('Failed to load feed details');
      } finally {
        setLoading(false);
      }
    };

    if (decodedUri) {
      loadFeedData();
    } else {
      setError('Invalid feed URI');
      setLoading(false);
    }
  }, [decodedUri]);

  const handleSubscribe = async () => {
    try {
      // TODO: Implement actual subscription logic
      setIsSubscribed(!isSubscribed);
      Alert.alert(
        'Success',
        isSubscribed ? 'Unsubscribed from feed' : 'Subscribed to feed'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update subscription');
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://bsky.app/profile/${feedData?.creator.handle}/feed/${feedData?.uri.split('/').pop()}`;
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: feedData?.displayName,
            text: feedData?.description,
            url: shareUrl,
          });
        } else {
          await navigator.clipboard.writeText(shareUrl);
          Alert.alert('Copied', 'Feed URL copied to clipboard');
        }
      } else {
        Alert.alert('Share', `Share this feed: ${shareUrl}`);
      }
    } catch (error) {
      console.error('Failed to share feed:', error);
      Alert.alert('Error', 'Failed to share feed');
    }
  };

  const handleCreatorPress = () => {
    if (feedData?.creator.handle) {
      router.push(`/profile/${feedData.creator.handle}`);
    }
  };

  const formatCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Feed"
          leftIcon={<ArrowLeft size={24} color="#111827" />}
          onLeftPress={() => router.back()}
        />
        <LoadingState message="Loading feed details..." />
      </View>
    );
  }

  if (error || !feedData) {
    return (
      <View style={styles.container}>
        <Header
          title="Feed"
          leftIcon={<ArrowLeft size={24} color="#111827" />}
          onLeftPress={() => router.back()}
        />
        <ErrorState
          title="Feed not found"
          description={error || 'This feed could not be loaded.'}
          onRetry={() => {
            setError(null);
            setLoading(true);
            // Retry loading logic would go here
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Feed"
        leftIcon={<ArrowLeft size={24} color="#111827" />}
        onLeftPress={() => router.back()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        {feedData.banner && (
          <View style={styles.bannerContainer}>
            <Image
              source={{ uri: feedData.banner }}
              style={styles.banner}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay} />
          </View>
        )}
        
        {/* Feed Info */}
        <View style={styles.feedInfo}>
          {/* Avatar and Actions */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarContainer}>
              <Avatar
                uri={feedData.avatar}
                size="xl"
                fallbackText={feedData.displayName}
                style={styles.avatar}
              />
            </View>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Share size={20} color="#6b7280" />
              </TouchableOpacity>
              
              <Button
                title={isSubscribed ? "Subscribed" : "Subscribe"}
                variant={isSubscribed ? "outline" : "primary"}
                size="medium"
                onPress={handleSubscribe}
                style={styles.subscribeButton}
              />
            </View>
          </View>

          {/* Feed Details */}
          <View style={styles.details}>
            <Text style={styles.displayName}>{feedData.displayName}</Text>
            
            {feedData.description && (
              <Text style={styles.description}>{feedData.description}</Text>
            )}
            
            {/* Creator Info */}
            <TouchableOpacity style={styles.creatorRow} onPress={handleCreatorPress}>
              <Avatar
                uri={feedData.creator.avatar}
                size="small"
                fallbackText={feedData.creator.displayName || feedData.creator.handle}
              />
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>
                  {feedData.creator.displayName || feedData.creator.handle}
                </Text>
                <Text style={styles.creatorHandle}>@{feedData.creator.handle}</Text>
              </View>
              <ExternalLink size={16} color="#6b7280" />
            </TouchableOpacity>
            
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Heart size={16} color="#6b7280" />
                <Text style={styles.statText}>
                  {formatCount(feedData.likeCount)} likes
                </Text>
              </View>
              <View style={styles.statItem}>
                <Users size={16} color="#6b7280" />
                <Text style={styles.statText}>
                  {formatCount(feedData.subscriberCount)} subscribers
                </Text>
              </View>
              <View style={styles.statItem}>
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.statText}>
                  Created {formatDate(feedData.indexedAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Feed Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Feed Preview</Text>
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewText}>
              Feed content would be displayed here. This would show recent posts from this custom feed.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    height: 200,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  feedInfo: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -48,
    marginBottom: 16,
  },
  avatarContainer: {
    borderWidth: 4,
    borderColor: '#ffffff',
    borderRadius: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 96,
    height: 96,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  subscribeButton: {
    paddingHorizontal: 24,
  },
  details: {
    gap: 12,
  },
  displayName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    gap: 12,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  creatorHandle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  previewSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  previewPlaceholder: {
    padding: 24,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});