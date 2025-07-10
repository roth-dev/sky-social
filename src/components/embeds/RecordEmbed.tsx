import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { EmbedRecord } from "@/types/embed";
import { Avatar } from "@/components/ui/Avatar";
import { Text, RichText } from "@/components/ui";
import { Quote } from "lucide-react-native";
import { RichText as RichTextAPI } from "@atproto/api";
import { Formater } from "@/lib/format";

interface RecordEmbedProps {
  record?: EmbedRecord;
  isDetailView?: boolean;
  onRecordPress?: (uri: string) => void;
}

export function RecordEmbed({
  record,
  isDetailView = false,
  onRecordPress,
}: RecordEmbedProps) {
  if (!record || !record.record) {
    return null;
  }

  const post = record.record;

  const handlePress = () => {
    if (onRecordPress && post.uri) {
      onRecordPress(post.uri);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isDetailView && styles.detailContainer]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Quote size={16} color="#6b7280" />
        <Text style={styles.quoteLabel}>Quote</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.authorRow}>
          <Avatar
            uri={post.author?.avatar}
            size="small"
            fallbackText={post.author?.displayName || post.author?.handle}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.displayName} numberOfLines={1}>
              {post.author?.displayName || post.author?.handle}
            </Text>
            <Text style={styles.handle} numberOfLines={1}>
              @{post.author?.handle}
            </Text>
            <Text style={styles.time}>·</Text>
            <Text style={styles.time}>{Formater.time(post.indexedAt)}</Text>
          </View>
        </View>

        {post.record?.text && (
          <RichText
            value={
              post.record.facets
                ? new RichTextAPI({
                    text: post.record.text,
                    facets: post.record.facets,
                  })
                : post.record.text
            }
            style={[styles.text, isDetailView && styles.detailText]}
            numberOfLines={isDetailView ? 6 : 4}
            disableLinks={false}
            enableTags={true}
          />
        )}

        {post.embed?.images && post.embed.images.length > 0 && (
          <View style={styles.embedIndicator}>
            <Text style={styles.embedText}>
              📷 {post.embed.images.length} image
              {post.embed.images.length > 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  detailContainer: {
    borderRadius: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
    gap: 6,
  },
  quoteLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  content: {
    padding: 12,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  authorInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  displayName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    maxWidth: 100,
  },
  handle: {
    fontSize: 14,
    color: "#6b7280",
    maxWidth: 80,
  },
  time: {
    fontSize: 14,
    color: "#6b7280",
  },
  text: {
    fontSize: 14,
    lineHeight: 18,
    color: "#374151",
  },
  detailText: {
    fontSize: 15,
    lineHeight: 20,
  },
  embedIndicator: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  embedText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
});
