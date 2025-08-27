import React from "react";
import { View, StyleSheet } from "react-native";
import { SettingsItem, SettingsItemData } from "./SettingsItem";
import { useSettings } from "@/contexts/SettingsContext";
import { Text } from "../ui";

export interface SettingsSectionData {
  id: string;
  title?: string;
  items: SettingsItemData[];
}

interface SettingsSectionProps {
  section: SettingsSectionData;
}

export function SettingsSection({ section }: SettingsSectionProps) {
  const { isDarkMode } = useSettings();

  return (
    <View style={styles.container}>
      {section.title && (
        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>
          {section.title}
        </Text>
      )}
      <View
        style={[styles.itemsContainer, isDarkMode && styles.darkItemsContainer]}
      >
        {section.items.map((item, index) => (
          <SettingsItem
            key={item.id}
            item={item}
            isLast={index === section.items.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  darkTitle: {
    color: "#999999",
  },
  itemsContainer: {
    backgroundColor: "#ffffff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    borderBottomColor: "#e5e7eb",
  },
  darkItemsContainer: {
    backgroundColor: "#000000",
    borderTopColor: "#333333",
    borderBottomColor: "#333333",
  },
});
