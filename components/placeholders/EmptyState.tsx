import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageCircle, Users, Heart, Image as ImageIcon, Search, Wifi } from 'lucide-react-native';

interface EmptyStateProps {
  type: 'timeline' | 'posts' | 'followers' | 'following' | 'likes' | 'media' | 'search' | 'offline';
  title?: string;
  description?: string;
  style?: any;
}

export function EmptyState({ type, title, description, style }: EmptyStateProps) {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'timeline':
        return {
          icon: <MessageCircle size={48} color="#9ca3af" />,
          title: title || 'Welcome to SocialSky!',
          description: description || 'Your timeline will appear here once you follow some people and they start posting.',
        };
      case 'posts':
        return {
          icon: <MessageCircle size={48} color="#9ca3af" />,
          title: title || 'No posts yet',
          description: description || 'When this user posts something, it will appear here.',
        };
      case 'followers':
        return {
          icon: <Users size={48} color="#9ca3af" />,
          title: title || 'No followers yet',
          description: description || 'When people follow this account, they will appear here.',
        };
      case 'following':
        return {
          icon: <Users size={48} color="#9ca3af" />,
          title: title || 'Not following anyone yet',
          description: description || 'When this user follows people, they will appear here.',
        };
      case 'likes':
        return {
          icon: <Heart size={48} color="#9ca3af" />,
          title: title || 'No liked posts yet',
          description: description || 'When this user likes posts, they will appear here.',
        };
      case 'media':
        return {
          icon: <ImageIcon size={48} color="#9ca3af" />,
          title: title || 'No media yet',
          description: description || 'When this user shares photos and videos, they will appear here.',
        };
      case 'search':
        return {
          icon: <Search size={48} color="#9ca3af" />,
          title: title || 'No results found',
          description: description || 'Try searching for something else or check your spelling.',
        };
      case 'offline':
        return {
          icon: <Wifi size={48} color="#9ca3af" />,
          title: title || 'You\'re offline',
          description: description || 'Check your internet connection and try again.',
        };
      default:
        return {
          icon: <MessageCircle size={48} color="#9ca3af" />,
          title: title || 'Nothing here yet',
          description: description || 'Content will appear here when available.',
        };
    }
  };

  const config = getEmptyStateConfig();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {config.icon}
      </View>
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.description}>{config.description}</Text>
    </View>
  );
}

interface LoadingStateProps {
  message?: string;
  style?: any;
}

export function LoadingState({ message = 'Loading...', style }: LoadingStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.loadingSpinner} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  style?: any;
}

export function ErrorState({ 
  title = 'Something went wrong',
  description = 'We encountered an error while loading this content.',
  onRetry,
  style 
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.errorIconContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
      </View>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#e5e7eb',
    borderTopColor: '#3b82f6',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

import { TouchableOpacity } from 'react-native';