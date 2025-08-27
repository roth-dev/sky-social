import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight, Plus } from "lucide-react-native";
import { useSettings } from "@/contexts/SettingsContext";
import { Trans } from "@lingui/react/macro";
import { Text } from "../ui";

interface AddAccountSectionProps {
  onAddAccount: () => void;
}

export function AddAccountSection({ onAddAccount }: AddAccountSectionProps) {
  const { isDarkMode } = useSettings();

  return (
    <TouchableOpacity
      style={[styles.container, isDarkMode && styles.darkContainer]}
      onPress={onAddAccount}
      activeOpacity={0.7}
    >
      <View
        style={[styles.iconContainer, isDarkMode && styles.darkIconContainer]}
      >
        <Plus size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
      </View>
      <Text style={[styles.text, isDarkMode && styles.darkText]}>
        <Trans>Add another account</Trans>
      </Text>
      <ChevronRight size={16} color={isDarkMode ? "#666666" : "#999999"} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  darkContainer: {
    backgroundColor: "#000000",
    borderBottomColor: "#333333",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  darkIconContainer: {
    backgroundColor: "#333333",
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    fontWeight: "400",
  },
  darkText: {
    color: "#ffffff",
  },
});
