import React from "react";
import { StyleSheet } from "react-native";
import { View } from "./View";
import { useSettings } from "@/contexts/SettingsContext";
import { Colors } from "@/constants/colors";

interface PlaceholderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Placeholder({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}: PlaceholderProps) {
  const { colorScheme } = useSettings();
  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: Colors.background.secondary[colorScheme],
        },
        style,
      ]}
    />
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
  lastLineWidth = "60%",
  style,
}: SkeletonTextProps) {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <Placeholder
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : "100%"}
          style={{ marginBottom: index < lines - 1 ? spacing : 0 }}
        />
      ))}
    </View>
  );
}

interface SkeletonAvatarProps {
  size?: "small" | "medium" | "large" | "xl";
  style?: any;
}

export function SkeletonAvatar({
  size = "medium",
  style,
}: SkeletonAvatarProps) {
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
    overflow: "hidden",
    position: "relative",
  },
  textContainer: {
    flex: 1,
  },
});
