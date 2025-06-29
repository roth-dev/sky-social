import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Placeholder, SkeletonText, SkeletonAvatar } from '@/components/ui/Placeholder';

const { width } = Dimensions.get('window');

interface ProfilePlaceholderProps {
  style?: any;
}

export function ProfilePlaceholder({ style }: ProfilePlaceholderProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Cover Image */}
      <Placeholder height={200} borderRadius={0} />
      
      {/* Profile Content */}
      <View style={styles.content}>
        {/* Avatar and Actions Row */}
        <View style={styles.avatarRow}>
          <View style={styles.avatarContainer}>
            <SkeletonAvatar size="xl" />
          </View>
          
          <View style={styles.actionsContainer}>
            <Placeholder width={36} height={36} borderRadius={18} />
            <Placeholder width={120} height={36} borderRadius={18} />
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          {/* Name */}
          <Placeholder width="60%" height={28} style={{ marginBottom: 4 }} />
          <Placeholder width="40%" height={16} style={{ marginBottom: 16 }} />
          
          {/* Description */}
          <SkeletonText
            lines={3}
            lineHeight={18}
            spacing={6}
            lastLineWidth="80%"
            style={{ marginBottom: 16 }}
          />
          
          {/* Metadata Row */}
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Placeholder width={14} height={14} borderRadius={7} />
              <Placeholder width={100} height={14} />
            </View>
            <View style={styles.metadataItem}>
              <Placeholder width={14} height={14} borderRadius={7} />
              <Placeholder width={120} height={14} />
            </View>
          </View>
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={styles.statItem}>
                <Placeholder width={40} height={16} />
                <Placeholder width={60} height={14} style={{ marginLeft: 4 }} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

interface ProfileTabPlaceholderProps {
  type?: 'posts' | 'media' | 'liked';
  style?: any;
}

export function ProfileTabPlaceholder({ type = 'posts', style }: ProfileTabPlaceholderProps) {
  if (type === 'media') {
    return (
      <View style={[styles.mediaContainer, style]}>
        {Array.from({ length: 9 }).map((_, index) => (
          <Placeholder
            key={index}
            width={(width - 48) / 3}
            height={(width - 48) / 3}
            style={styles.mediaItem}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={style}>
      {Array.from({ length: 5 }).map((_, index) => (
        <PostPlaceholder
          key={index}
          showImage={Math.random() > 0.6}
          showEmbed={Math.random() > 0.7}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  content: {
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
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileInfo: {
    gap: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 4,
  },
  mediaItem: {
    borderRadius: 8,
  },
});

// Import PostPlaceholder to avoid circular dependency
import { PostPlaceholder } from './PostPlaceholder';