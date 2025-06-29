import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
  Easing
} from 'react-native-reanimated';

interface PlaceholderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Placeholder({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}: PlaceholderProps) {
  const shimmerValue = useSharedValue(0);

  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.bezier(0.4, 0.0, 0.6, 1.0),
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-100, 100]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View 
      style={[
        styles.container,
        { width, height, borderRadius },
        style
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
}

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  lastLineWidth?: string;
  style?: any;
}

export function SkeletonText({ 
  lines = 3, 
  lineHeight = 16, 
  spacing = 8,
  lastLineWidth = '60%',
  style 
}: SkeletonTextProps) {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <Placeholder
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          style={{ marginBottom: index < lines - 1 ? spacing : 0 }}
        />
      ))}
    </View>
  );
}

interface SkeletonAvatarProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  style?: any;
}

export function SkeletonAvatar({ size = 'medium', style }: SkeletonAvatarProps) {
  const sizeValue = {
    small: 32,
    medium: 40,
    large: 64,
    xl: 96,
  }[size];

  return (
    <Placeholder
      width={sizeValue}
      height={sizeValue}
      borderRadius={sizeValue / 2}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    width: 100,
  },
  textContainer: {
    flex: 1,
  },
});