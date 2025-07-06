import React from "react";
import { StyleSheet } from "react-native";
import { PostPlaceholder } from "./PostPlaceholder";
import { ReplyPlaceholder } from "./ReplyPlaceholder";
import { Placeholder } from "@/components/ui/Placeholder";
import { View, Text } from "../ui";
import { useSettings } from "@/contexts/SettingsContext";
import { Colors } from "@/constants/colors";

interface PostScreenPlaceholderProps {
  showReplies?: boolean;
  replyCount?: number;
}

export function PostScreenPlaceholder({
  showReplies = true,
  replyCount = 3,
}: PostScreenPlaceholderProps) {
  const { colorScheme } = useSettings();

  return (
    <View style={styles.container}>
      {/* Main Post Placeholder */}
      <View style={styles.mainPost}>
        <PostPlaceholder
          showImage={true}
          isDetailView={true}
          style={{
            borderBottomColor: Colors.border[colorScheme],
          }}
        />
      </View>

      {/* Replies Section */}
      {showReplies && (
        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>
            {replyCount} {replyCount === 1 ? "Reply" : "Replies"}
          </Text>

          {/* Reply Placeholders */}
          {Array.from({ length: replyCount }).map((_, index) => (
            <View key={index} style={styles.replyItem}>
              <ReplyPlaceholder />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  mainPost: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  repliesSection: {
    paddingTop: 16,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  replyItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
});
