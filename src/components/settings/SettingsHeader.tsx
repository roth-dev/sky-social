import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { ATProfile } from "@/types/atproto";
import { useSettings } from "@/contexts/SettingsContext";
import { Trans } from "@lingui/react/macro";
import { Text } from "../ui";

interface SettingsHeaderProps {
  user: ATProfile;
  onSignOut: () => void;
  onProfilePress?: () => void;
}

export function SettingsHeader({
  user,
  onSignOut,
  onProfilePress,
}: SettingsHeaderProps) {
  const { isDarkMode } = useSettings();

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <TouchableOpacity
        style={[styles.profileRow, isDarkMode && styles.darkProfileRow]}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <Avatar
          uri={user.avatar}
          size="large"
          fallbackText={user.displayName || user.handle}
        />
        <View style={styles.userInfo}>
          <Text style={[styles.displayName, isDarkMode && styles.darkText]}>
            {user.displayName || user.handle}
          </Text>
          <Text style={[styles.handle, isDarkMode && styles.darkSecondaryText]}>
            @{user.handle}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.signOutButton, isDarkMode && styles.darkSignOutButton]}
          onPress={onSignOut}
        >
          <Text
            style={[styles.signOutText, isDarkMode && styles.darkSignOutText]}
          >
            <Trans>Sign out</Trans>
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  darkProfileRow: {
    // Add any dark mode specific styles if needed
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  displayName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  handle: {
    fontSize: 14,
    color: "#666666",
  },
  signOutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  darkSignOutButton: {
    // Add dark mode button styles if needed
  },
  signOutText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#999999",
  },
  darkSignOutText: {
    color: "#007AFF",
  },
});
