import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  uri?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  fallbackText?: string;
  style?: any;
}

export function Avatar({ uri, size = 'medium', fallbackText, style }: AvatarProps) {
  const sizeStyle = styles[size];
  
  return (
    <View style={[styles.container, sizeStyle, style]}>
      {uri ? (
        <Image source={{ uri }} style={[styles.image, sizeStyle]} />
      ) : (
        <View style={[styles.fallback, sizeStyle]}>
          <Text style={[styles.fallbackText, styles[`${size}Text`]]}>
            {fallbackText?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  small: {
    width: 32,
    height: 32,
  },
  medium: {
    width: 40,
    height: 40,
  },
  large: {
    width: 64,
    height: 64,
  },
  xl: {
    width: 96,
    height: 96,
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 20,
  },
  xlText: {
    fontSize: 32,
  },
});