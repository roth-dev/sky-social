import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { PostPlaceholder } from './PostPlaceholder';

interface FeedPlaceholderProps {
  count?: number;
  showVariety?: boolean;
  style?: any;
}

export function FeedPlaceholder({ 
  count = 5, 
  showVariety = true,
  style 
}: FeedPlaceholderProps) {
  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {Array.from({ length: count }).map((_, index) => (
        <PostPlaceholder
          key={index}
          showImage={showVariety && Math.random() > 0.5}
          showEmbed={showVariety && Math.random() > 0.7}
        />
      ))}
    </ScrollView>
  );
}

interface TimelinePlaceholderProps {
  style?: any;
}

export function TimelinePlaceholder({ style }: TimelinePlaceholderProps) {
  return (
    <View style={[styles.timelineContainer, style]}>
      {/* Header placeholder */}
      <View style={styles.headerPlaceholder}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.iconPlaceholder} />
          </View>
          <View style={styles.headerCenter}>
            <View style={styles.titlePlaceholder} />
          </View>
          <View style={styles.headerRight}>
            <View style={styles.iconPlaceholder} />
          </View>
        </View>
      </View>
      
      {/* Feed placeholder */}
      <FeedPlaceholder count={6} showVariety={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerPlaceholder: {
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    paddingTop: 44, // Safe area top
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  titlePlaceholder: {
    width: 120,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
});