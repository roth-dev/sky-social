import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, ScrollView, RefreshControl, Alert } from "react-native";
import { Header } from "@/components/Header";
import { useSettings } from "@/contexts/SettingsContext";
import { Text, View } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Trans } from "@lingui/react/macro";
import { UserX, Users } from "lucide-react-native";
import { useModerationAPI, MutedUser } from "@/hooks/useModerationAPI";

export default function MutedUsersScreen() {
  const { isDarkMode } = useSettings();
  const { getMutedUsers, unmuteUser } = useModerationAPI();
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMutedUsers = useCallback(async () => {
    try {
      setLoading(true);
      const users = await getMutedUsers();
      setMutedUsers(users);
    } catch (error) {
      console.error("Failed to load muted users:", error);
      Alert.alert("Error", "Failed to load muted users");
    } finally {
      setLoading(false);
    }
  }, [getMutedUsers]);

  const handleUnmute = useCallback(
    async (userDid: string, handle: string) => {
      Alert.alert(
        "Unmute User",
        `Are you sure you want to unmute @${handle}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Unmute",
            onPress: async () => {
              try {
                const success = await unmuteUser(userDid);
                if (success) {
                  setMutedUsers((prev) =>
                    prev.filter((user) => user.did !== userDid)
                  );
                  Alert.alert("Success", `@${handle} has been unmuted`);
                } else {
                  Alert.alert("Error", "Failed to unmute user");
                }
              } catch (error) {
                console.error("Failed to unmute user:", error);
                Alert.alert("Error", "Failed to unmute user");
              }
            },
          },
        ]
      );
    },
    [unmuteUser]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMutedUsers();
    setRefreshing(false);
  }, [loadMutedUsers]);

  useEffect(() => {
    loadMutedUsers();
  }, [loadMutedUsers]);

  const renderMutedUser = (mutedUser: MutedUser) => {
    const mutedDate = new Date(mutedUser.mutedAt);
    const formattedDate = mutedDate.toLocaleDateString();

    return (
      <View
        key={mutedUser.did}
        style={[styles.userItem, isDarkMode && styles.darkUserItem]}
      >
        <View style={styles.userInfo}>
          <View style={[styles.avatar, isDarkMode && styles.darkAvatar]}>
            <UserX size={24} color={isDarkMode ? "#8e8e93" : "#666666"} />
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.displayName, isDarkMode && styles.darkText]}>
              {mutedUser.displayName || mutedUser.handle}
            </Text>
            <Text
              style={[styles.handle, isDarkMode && styles.darkSecondaryText]}
            >
              @{mutedUser.handle}
            </Text>
            <Text
              style={[styles.mutedDate, isDarkMode && styles.darkSecondaryText]}
            >
              <Trans>Muted on {formattedDate}</Trans>
              {mutedUser.duration && (
                <Text> • {mutedUser.duration}h remaining</Text>
              )}
            </Text>
          </View>
        </View>
        <Button
          variant="destructive"
          size="small"
          title="Unmute"
          onPress={() => handleUnmute(mutedUser.did, mutedUser.handle)}
          style={styles.unmuteButton}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, isDarkMode && styles.darkEmptyIcon]}>
        <Users size={48} color={isDarkMode ? "#8e8e93" : "#c7c7cc"} />
      </View>
      <Text style={[styles.emptyTitle, isDarkMode && styles.darkText]}>
        <Trans>No muted users</Trans>
      </Text>
      <Text
        style={[styles.emptyMessage, isDarkMode && styles.darkSecondaryText]}
      >
        <Trans>
          Users you mute will appear here. Muted users won&apos;t appear in your
          timeline, and their replies won&apos;t be shown to you.
        </Trans>
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Header title="Muted Users" />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text
              style={[
                styles.loadingText,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              <Trans>Loading muted users...</Trans>
            </Text>
          </View>
        ) : mutedUsers.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.usersList}>
            {mutedUsers.map(renderMutedUser)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  darkHeader: {
    backgroundColor: "#1c1c1e",
    borderBottomColor: "#38383a",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Loading and empty states
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: "#8e8e93",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  darkEmptyIcon: {
    backgroundColor: "#2c2c2e",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 16,
    color: "#8e8e93",
    lineHeight: 24,
    textAlign: "center",
  },

  // Users list
  usersList: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5ea",
    backgroundColor: "#ffffff",
  },
  darkUserItem: {
    backgroundColor: "#1c1c1e",
    borderBottomColor: "#38383a",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  darkAvatar: {
    backgroundColor: "#2c2c2e",
  },
  userDetails: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 2,
  },
  handle: {
    fontSize: 14,
    color: "#8e8e93",
    marginBottom: 2,
  },
  mutedDate: {
    fontSize: 12,
    color: "#8e8e93",
  },
  unmuteButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Dark mode text
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#8e8e93",
  },
});
