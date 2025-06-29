import React from "react";
import { View, StyleSheet } from "react-native";
import { Placeholder } from "@/components/ui/Placeholder";
import { Play } from "lucide-react-native";

interface VideoPlaceholderProps {
  aspectRatio?: { width: number; height: number };
  isDetailView?: boolean;
  style?: any;
}

export function VideoPlaceholder({
  aspectRatio,
  isDetailView = false,
  style,
}: VideoPlaceholderProps) {
  const defaultAspectRatio = 16 / 9;
  const ratio = aspectRatio
    ? aspectRatio.width / aspectRatio.height
    : defaultAspectRatio;

  const height = isDetailView ? 300 : 200;

  return (
    <View style={[styles.container, { height }, style]}>
      <Placeholder
        height={height}
        borderRadius={12}
        style={styles.videoPlaceholder}
      />

      {/* Play button overlay */}
      <View style={styles.overlay}>
        <View style={styles.playButton}>
          <Play size={32} color="#ffffff" fill="#ffffff" />
        </View>

        {/* Video indicator */}
        <View style={styles.videoIndicator}>
          <View style={styles.liveDot} />
          <Placeholder width={40} height={12} style={styles.videoLabel} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    position: "relative",
  },
  videoPlaceholder: {
    backgroundColor: "#e5e7eb",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  videoIndicator: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
  },
  videoLabel: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
});
