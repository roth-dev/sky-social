import React from "react";
import { StyleSheet } from "react-native";
import { PostPlaceholder } from "./PostPlaceholder";
import { View } from "../ui";
import { useSettings } from "@/contexts/SettingsContext";
import { Colors } from "@/constants/colors";

interface ReplyPlaceholderProps {
  style?: any;
}

export function ReplyPlaceholder({ style }: ReplyPlaceholderProps) {
  const { colorScheme } = useSettings();

  return (
    <View style={[styles.container, style]}>
      <PostPlaceholder
        style={{
          borderBottomColor: Colors.border[colorScheme],
          paddingLeft: 32,
          borderLeftWidth: 2,
          borderLeftColor: "#e5e7eb",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
});
