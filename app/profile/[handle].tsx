import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Header } from '@/components/Header';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabContent } from '@/components/profile/ProfileTabContent';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useProfile, 
  useAuthorFeed, 
  useActorLikes, 
  useAuthorMediaFeed,
  useFollowProfile,
  useUnfollowProfile
} from '@/lib/queries';
import { ArrowLeft, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';

const TABS = [
  { key: 'posts', title: 'Posts' },
  { key: 'media', title: 'Media' },
  { key: 'liked', title: 'Liked' },
];

export default function UserProfileScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  // Queries
  const profileQuery = useProfile(handle || '');
  const postsQuery = useAuthorFeed(handle || '');
  const likedQuery = useActorLikes(handle || '');
  const mediaQuery = useAuthorMediaFeed(handle || '');

  // Mutations
  const followMutation = useFollowProfile();
  const unfollowMutation = useUnfollowProfile();

  const isOwnProfile = currentUser?.handle === handle;
  const user = profileQuery.data;
  const isFollowing = !!user?.viewer?.following;

  const handleFollow = async () => {
    if (!user || !isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in to follow users');
      return;
    }
    
    try {
      if (isFollowing && user.viewer?.following) {
        await unfollowMutation.mutateAsync({ followUri: user.viewer.following });
      } else {
        await followMutation.mutateAsync({ did: user.did });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handleMessage = () => {
    Alert.alert('Coming Soon', 'Direct messaging will be available soon!');
  };

  const handleMorePress = () => {
    Alert.alert('More Options', 'Additional options coming soon!');
  };

  const onRefresh = () => {
    profileQuery.refetch();
    switch (activeTab) {
      case 'posts':
        postsQuery.refetch();
        break;
      case 'liked':
        likedQuery.refetch();
        break;
      case 'media':
        mediaQuery.refetch();
        break;
    }
  };

  const handleLoadMore = () => {
    switch (activeTab) {
      case 'posts':
        if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
          postsQuery.fetchNextPage();
        }
        break;
      case 'liked':
        if (likedQuery.hasNextPage && !likedQuery.isFetchingNextPage) {
          likedQuery.fetchNextPage();
        }
        break;
      case 'media':
        if (mediaQuery.hasNextPage && !mediaQuery.isFetchingNextPage) {
          mediaQuery.fetchNextPage();
        }
        break;
    }
  };

  const getTabData = (tabKey: string) => {
    switch (tabKey) {
      case 'posts':
        return postsQuery.data?.pages.flatMap(page => page.feed) || [];
      case 'liked':
        return likedQuery.data?.pages.flatMap(page => page.feed) || [];
      case 'media':
        return mediaQuery.data || [];
      default:
        return [];
    }
  };

  const getTabCount = (tabKey: string) => {
    switch (tabKey) {
      case 'posts':
        return user?.postsCount || 0;
      case 'liked':
        return likedQuery.data?.pages.flatMap(page => page.feed).length || 0;
      case 'media':
        return mediaQuery.data?.length || 0;
      default:
        return 0;
    }
  };

  const getTabLoading = (tabKey: string) => {
    switch (tabKey) {
      case 'posts':
        return postsQuery.isLoading;
      case 'liked':
        return likedQuery.isLoading;
      case 'media':
        return mediaQuery.isLoading;
      default:
        return false;
    }
  };

  const isRefreshing = profileQuery.isFetching || 
    (activeTab === 'posts' && postsQuery.isFetching) ||
    (activeTab === 'liked' && likedQuery.isFetching) ||
    (activeTab === 'media' && mediaQuery.isFetching);

  const followLoading = followMutation.isPending || unfollowMutation.isPending;

  if (profileQuery.isLoading) {
    return (
      <View style={styles.container}>
        <Header 
          title="Profile"
          leftIcon={<ArrowLeft size={24} color="#111827" />}
          onLeftPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (profileQuery.error || !user) {
    return (
      <View style={styles.container}>
        <Header 
          title="Profile"
          leftIcon={<ArrowLeft size={24} color="#111827" />}
          onLeftPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {profileQuery.error?.message || 'User not found'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={user.displayName || user.handle}
        leftIcon={<ArrowLeft size={24} color="#111827" />}
        rightIcon={<MoreHorizontal size={24} color="#111827" />}
        onLeftPress={() => router.back()}
        onRightPress={handleMorePress}
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          followLoading={followLoading}
          onFollow={handleFollow}
          onMessage={handleMessage}
          onEditProfile={() => Alert.alert('Coming Soon', 'Profile editing will be available soon!')}
          onMorePress={handleMorePress}
        />
        
        {/* Tab Bar */}
        <View style={styles.tabBarContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBar}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabItem,
                  activeTab === tab.key && styles.activeTabItem
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText
                ]}>
                  {tab.title}
                </Text>
                <Text style={[
                  styles.tabCount,
                  activeTab === tab.key && styles.activeTabCount
                ]}>
                  {getTabCount(tab.key)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Tab Content */}
        <View style={styles.tabContentContainer}>
          <ProfileTabContent
            tabKey={activeTab}
            data={getTabData(activeTab)}
            loading={getTabLoading(activeTab)}
            onRefresh={() => {}}
            onLoadMore={handleLoadMore}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  tabBarContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 8,
  },
  activeTabItem: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
  },
  activeTabText: {
    color: '#3b82f6',
  },
  tabCount: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  activeTabCount: {
    color: '#3b82f6',
  },
  tabContentContainer: {
    flex: 1,
    minHeight: 400,
  },
});