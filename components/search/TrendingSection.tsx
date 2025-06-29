import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { SearchActor, FeedGenerator } from '@/types/search';
import { TrendingUp, Users, Rss } from 'lucide-react-native';

interface TrendingSectionProps {
  suggestedUsers?: SearchActor[];
  popularFeeds?: FeedGenerator[];
  onUserPress?: (user: SearchActor) => void;
  onFeedPress?: (feed: FeedGenerator) => void;
  onSeeAllUsers?: () => void;
  onSeeAllFeeds?: () => void;
}

export function TrendingSection({
  suggestedUsers = [],
  popularFeeds = [],
  onUserPress,
  onFeedPress,
  onSeeAllUsers,
  onSeeAllFeeds,
}: TrendingSectionProps) {
  const renderSuggestedUser = (user: SearchActor) => (
    <TouchableOpacity
      key={user.did}
      style={styles.userCard}
      onPress={() => onUserPress?.(user)}
    >
      <Avatar
        uri={user.avatar}
        size="medium"
        fallbackText={user.displayName || user.handle}
      />
      <Text style={styles.userName} numberOfLines={1}>
        {user.displayName || user.handle}
      </Text>
      <Text style={styles.userHandle} numberOfLines={1}>
        @{user.handle}
      </Text>
    </TouchableOpacity>
  );

  const renderPopularFeed = (feed: FeedGenerator) => (
    <TouchableOpacity
      key={feed.uri}
      style={styles.feedCard}
      onPress={() => onFeedPress?.(feed)}
    >
      <Avatar
        uri={feed.avatar}
        size="medium"
        fallbackText={feed.displayName}
      />
      <Text style={styles.feedName} numberOfLines={1}>
        {feed.displayName}
      </Text>
      <Text style={styles.feedCreator} numberOfLines={1}>
        by @{feed.creator.handle}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Trending Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TrendingUp size={24} color="#3b82f6" />
          <Text style={styles.headerTitle}>Discover</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Find interesting people and feeds to follow
        </Text>
      </View>

      {/* Suggested People */}
      {suggestedUsers.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Users size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Suggested People</Text>
            </View>
            {onSeeAllUsers && (
              <TouchableOpacity onPress={onSeeAllUsers}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {suggestedUsers.slice(0, 10).map(renderSuggestedUser)}
          </ScrollView>
        </View>
      )}

      {/* Popular Feeds */}
      {popularFeeds.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Rss size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Popular Feeds</Text>
            </View>
            {onSeeAllFeeds && (
              <TouchableOpacity onPress={onSeeAllFeeds}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {popularFeeds.slice(0, 10).map(renderPopularFeed)}
          </ScrollView>
        </View>
      )}

      {/* Search Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Search Tips</Text>
        <View style={styles.tipsContainer}>
          <View style={styles.tip}>
            <Text style={styles.tipTitle}>Find people</Text>
            <Text style={styles.tipDescription}>
              Search by handle (@username) or display name
            </Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipTitle}>Discover posts</Text>
            <Text style={styles.tipDescription}>
              Use keywords to find posts about topics you're interested in
            </Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipTitle}>Explore feeds</Text>
            <Text style={styles.tipDescription}>
              Find custom feeds created by the community
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  userCard: {
    width: 120,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    textAlign: 'center',
  },
  userHandle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  feedCard: {
    width: 140,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  feedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    textAlign: 'center',
  },
  feedCreator: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  tipsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  tip: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});