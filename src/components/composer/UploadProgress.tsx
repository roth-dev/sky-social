import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui";
import { Loader2 } from "lucide-react-native";

interface UploadProgressProps {
  isUploading: boolean;
  progress?: number;
  uploadType: "image" | "video";
}

export function UploadProgress({
  isUploading,
  progress,
  uploadType,
}: UploadProgressProps) {
  if (!isUploading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Loader2 size={24} color="#3b82f6" />
        <Text size="sm" className="text-gray-700 ml-2">
          Uploading {uploadType}
          {typeof progress === "number" && ` ${Math.round(progress)}%`}...
        </Text>
      </View>
      {typeof progress === "number" && (
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(0, Math.min(100, progress))}%` },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 8,
    padding: 12,
    margin: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
});
