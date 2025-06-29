import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Placeholder, SkeletonText, SkeletonAvatar } from '@/components/ui/Placeholder';

interface PostPlaceholderProps {
  showImage?: boolean;
  showEmbed?: boolean;
  isDetailView?: boolean;
  style?: any;
}

export function PostPlaceholder({ 
  showImage = false, 
  showEmbed = false,
  isDetailView = false,
  style 
}: PostPlaceholderProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonAvatar size={isDetailView ? "large" : "medium"} />
        
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Placeholder width={120} height={16} style={styles.nameItem} />
            <Placeholder width={80} height={16} style={styles.nameItem} />
            {!isDetailView && (
              <Placeholder width={30} height={16} />
            )}
          </View>
          
          {isDetailView && (
            <Placeholder width={150} height={14} style={{ marginTop: 4 }} />
          )}
        </View>
        
        <Placeholder width={20} height={20} borderRadius={10} />
      </View>

      {/* Content */}
      <View style={[styles.content, isDetailView && styles.detailContent]}>
        <SkeletonText
          lines={isDetailView ? 4 : 2}
          lineHeight={isDetailView ? 20 : 16}
          spacing={isDetailView ? 8 : 6}
          lastLineWidth="75%"
        />
        
        {/* Image placeholder */}
        {showImage && (
          <Placeholder
            height={isDetailView ? 300 : 200}
            borderRadius={12}
            style={{ marginTop: 12 }}
          />
        )}
        
        {/* Embed placeholder */}
        {showEmbed && (
          <View style={styles.embedContainer}>
            <Placeholder height={120} borderRadius={8} />
            <View style={styles.embedContent}>
              <Placeholder width="40%" height={12} />
              <Placeholder width="90%" height={16} style={{ marginTop: 6 }} />
              <Placeholder width="70%" height={14} style={{ marginTop: 4 }} />
            </View>
          </View>
        )}
      </View>

      {/* Detail stats */}
      {isDetailView && (
        <View style={styles.detailStats}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.statGroup}>
              <Placeholder width={30} height={18} />
              <Placeholder width={50} height={12} style={{ marginTop: 2 }} />
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={[styles.actions, isDetailView && styles.detailActions]}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={styles.actionButton}>
            <Placeholder width={20} height={20} borderRadius={10} />
            {!isDetailView && (
              <Placeholder width={20} height={12} style={{ marginLeft: 6 }} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameItem: {
    borderRadius: 8,
  },
  content: {
    marginLeft: 52,
  },
  detailContent: {
    marginLeft: 0,
    marginTop: 12,
  },
  embedContainer: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  embedContent: {
    padding: 12,
  },
  detailStats: {
    flexDirection: 'row',
    gap: 24,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    marginTop: 16,
  },
  statGroup: {
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginLeft: 52,
    paddingRight: 40,
  },
  detailActions: {
    marginLeft: 0,
    paddingRight: 0,
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});