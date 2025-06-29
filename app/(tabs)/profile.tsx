import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Header } from '@/components/Header';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabContent } from '@/components/profile/ProfileTabContent';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useAuthorFeed, useActorLikes, useAuthorMediaFeed } from '@/lib/queries';
import { Settings } from 'lucide-react-native';

const TABS = [
  { key: 'posts', title: 'Posts' },
  { key: 'media', title: 'Media' },
  { key: 'liked', title: 'Liked' },
];

export default function ProfileScreen() {
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  // Queries
  const profileQuery = useProfile(user?.handle || '');
  const postsQuery = useAuthorFeed(user?.handle || '');
  const likedQuery = useActorLikes(user?.handle || '');
  const mediaQuery = useAuthorMediaFeed(user?.handle || '');

  const handleEditProfile = () => {
    Alert.alert('Coming Soon', 'Profile editing will be available soon!');
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
        return profileQuery.data?.postsCount || 0;
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

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Header title="Profile" />
        <View style={styles.notAuthenticatedContainer}>
          <Text style={styles.notAuthenticatedText}>
            Please log in to view your profile
          </Text>
        </View>
      </View>
    );
  }

  const currentProfile = profileQuery.data || user;

  return (
    <View style={styles.container}>
      <Header
        title={currentProfile.displayName || currentProfile.handle}
        rightIcon={<Settings size={24} color="#111827" />}
        onRightPress={() => logout()}
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
          user={currentProfile}
          isOwnProfile={true}
          onEditProfile={handleEditProfile}
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
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: '#6b7280',
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