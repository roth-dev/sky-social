import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight, Sun, Moon, Monitor } from "lucide-react-native";
import { useSettings, ThemeMode } from "@/contexts/SettingsContext";
import { Trans } from "@lingui/react/macro";

interface ThemeSettingsItemProps {
  onPress: () => void;
  currentTheme: ThemeMode;
}

export function ThemeSettingsItem({
  onPress,
  currentTheme,
}: ThemeSettingsItemProps) {
  const { isDarkMode } = useSettings();

  const getThemeIcon = () => {
    switch (currentTheme) {
      case "light":
        return <Sun size={20} color="#f59e0b" />;
      case "dark":
        return <Moon size={20} color="#6366f1" />;
      case "system":
        return <Monitor size={20} color="#6b7280" />;
      default:
        return <Monitor size={20} color="#6b7280" />;
    }
  };

  const getThemeDisplayName = () => {
    switch (currentTheme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return currentTheme;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isDarkMode && styles.darkContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>{getThemeIcon()}</View>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          <Trans>Theme</Trans>
        </Text>
      </View>

      <View style={styles.rightContent}>
        <Text style={[styles.value, isDarkMode && styles.darkSecondaryText]}>
          {getThemeDisplayName()}
        </Text>
        <ChevronRight size={16} color={isDarkMode ? "#666666" : "#999999"} />
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  darkContainer: {
    backgroundColor: "#000000",
    borderBottomColor: "#333333",
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
  title: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000000",
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
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#999999",
  },
});
