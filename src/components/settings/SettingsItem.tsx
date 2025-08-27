import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useSettings } from "@/contexts/SettingsContext";
import { Text } from "../ui";

export interface SettingsItemData {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  disabled?: boolean;
}

interface SettingsItemProps {
  item: SettingsItemData;
  isLast?: boolean;
}

export function SettingsItem({ item, isLast = false }: SettingsItemProps) {
  const { isDarkMode } = useSettings();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isDarkMode && styles.darkContainer,
        !isLast && styles.borderBottom,
        !isLast && isDarkMode && styles.darkBorderBottom,
        item.disabled && styles.disabled,
      ]}
      onPress={item.onPress}
      disabled={item.disabled}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>{item.icon}</View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              isDarkMode && styles.darkText,
              item.destructive && styles.destructiveText,
              item.disabled && styles.disabledText,
            ]}
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text
              style={[
                styles.subtitle,
                isDarkMode && styles.darkSecondaryText,
                item.disabled && styles.disabledText,
              ]}
            >
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightContent}>
        {item.value && (
          <Text
            style={[
              styles.value,
              isDarkMode && styles.darkSecondaryText,
              item.disabled && styles.disabledText,
            ]}
          >
            {item.value}
          </Text>
        )}
        {item.showChevron && (
          <ChevronRight
            size={16}
            color={
              item.disabled
                ? isDarkMode
                  ? "#555555"
                  : "#cccccc"
                : isDarkMode
                ? "#666666"
                : "#999999"
            }
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  darkBorderBottom: {
    borderBottomColor: "#333333",
  },
  disabled: {
    opacity: 0.5,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  value: {
    fontSize: 14,
    color: "#666666",
  },
  destructiveText: {
    color: "#ff3b30",
  },
  disabledText: {
    opacity: 0.5,
  },
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#999999",
  },
});
