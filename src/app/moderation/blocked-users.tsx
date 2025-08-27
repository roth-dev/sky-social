import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, ScrollView, RefreshControl, Alert } from "react-native";
import { Header } from "@/components/Header";
import { useSettings } from "@/contexts/SettingsContext";
import { Text, View } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Trans } from "@lingui/react/macro";
import { UserX, Users, AlertCircle } from "lucide-react-native";
import { useModerationAPI, BlockedUser } from "@/hooks/useModerationAPI";

export default function BlockedUsersScreen() {
  const { isDarkMode } = useSettings();
  const { getBlockedUsers, unblockUser } = useModerationAPI();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBlockedUsers = useCallback(async () => {
    try {
      setLoading(true);
      const users = await getBlockedUsers();
      setBlockedUsers(users);
    } catch (error) {
      console.error("Failed to load blocked users:", error);
      Alert.alert("Error", "Failed to load blocked users");
    } finally {
      setLoading(false);
    }
  }, [getBlockedUsers]);

  const handleUnblock = useCallback(
    async (userDid: string, handle: string) => {
      Alert.alert(
        "Unblock User",
        `Are you sure you want to unblock @${handle}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Unblock",
            style: "destructive",
            onPress: async () => {
              try {
                const success = await unblockUser(userDid);
                if (success) {
                  setBlockedUsers((prev) =>
                    prev.filter((user) => user.did !== userDid)
                  );
                  Alert.alert("Success", `@${handle} has been unblocked`);
                } else {
                  Alert.alert("Error", "Failed to unblock user");
                }
              } catch (error) {
                console.error("Failed to unblock user:", error);
                Alert.alert("Error", "Failed to unblock user");
              }
            },
          },
        ]
      );
    },
    [unblockUser]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBlockedUsers();
    setRefreshing(false);
  }, [loadBlockedUsers]);

  useEffect(() => {
    loadBlockedUsers();
  }, [loadBlockedUsers]);

  const renderBlockedUser = (blockedUser: BlockedUser) => {
    return (
      <View
        key={blockedUser.did}
        style={[styles.userItem, isDarkMode && styles.darkUserItem]}
      >
        <View style={styles.userInfo}>
          <View style={[styles.avatar, isDarkMode && styles.darkAvatar]}>
            <UserX size={24} color={isDarkMode ? "#8e8e93" : "#6e6e73"} />
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.displayName, isDarkMode && styles.darkText]}>
              {blockedUser.displayName || blockedUser.handle}
            </Text>
            <Text
              style={[styles.handle, isDarkMode && styles.darkSecondaryText]}
            >
              @{blockedUser.handle}
            </Text>
            <Text
              style={[
                styles.blockedDate,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              Blocked {new Date(blockedUser.blockedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Button
          title="Unblock"
          variant="secondary"
          size="small"
          onPress={() => handleUnblock(blockedUser.did, blockedUser.handle)}
          style={styles.unblockButton}
        />
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={[styles.emptyState, isDarkMode && styles.darkEmptyState]}>
        <View style={styles.emptyIcon}>
          <Users size={48} color={isDarkMode ? "#8e8e93" : "#6e6e73"} />
        </View>
        <Text style={[styles.emptyTitle, isDarkMode && styles.darkText]}>
          <Trans>No Blocked Users</Trans>
        </Text>
        <Text
          style={[
            styles.emptyDescription,
            isDarkMode && styles.darkSecondaryText,
          ]}
        >
          <Trans>
            You have not blocked any users yet. When you block someone, they
            will appear here.
          </Trans>
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Header title="Blocked Users" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? "#ffffff" : "#000000"}
          />
        }
      >
        <View style={styles.content}>
          {/* Info Card */}
          <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
            <View style={styles.infoIcon}>
              <AlertCircle
                size={24}
                color={isDarkMode ? "#ffffff" : "#007AFF"}
              />
            </View>
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, isDarkMode && styles.darkText]}>
                <Trans>About Blocking</Trans>
              </Text>
              <Text
                style={[
                  styles.infoDescription,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                <Trans>
                  Blocked users cannot see your posts, follow you, or send you
                  messages. They will not be notified that you have blocked
                  them.
                </Trans>
              </Text>
            </View>
          </View>

          {/* Users List */}
          {loading ? (
            <View
              style={[
                styles.loadingState,
                isDarkMode && styles.darkLoadingState,
              ]}
            >
              <Text
                style={[
                  styles.loadingText,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                <Trans>Loading blocked users...</Trans>
              </Text>
            </View>
          ) : blockedUsers.length > 0 ? (
            <View
              style={[styles.usersList, isDarkMode && styles.darkUsersList]}
            >
              {blockedUsers.map(renderBlockedUser)}
            </View>
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },

  // Info Card
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  darkInfoCard: {
    backgroundColor: "#1c1c1e",
    shadowOpacity: 0.2,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: "#6e6e73",
    lineHeight: 20,
  },

  // Users List
  usersList: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  darkUsersList: {
    backgroundColor: "#1c1c1e",
    shadowOpacity: 0.2,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5ea",
  },
  darkUserItem: {
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
    color: "#6e6e73",
    marginBottom: 2,
  },
  blockedDate: {
    fontSize: 12,
    color: "#8e8e93",
  },
  unblockButton: {
    marginLeft: 12,
    minWidth: 80,
  },

  // Empty State
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  darkEmptyState: {
    backgroundColor: "#1c1c1e",
    shadowOpacity: 0.2,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6e6e73",
    lineHeight: 20,
    textAlign: "center",
  },

  // Loading State
  loadingState: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  darkLoadingState: {
    backgroundColor: "#1c1c1e",
    shadowOpacity: 0.2,
  },
  loadingText: {
    fontSize: 16,
    color: "#6e6e73",
  },

  // Dark mode text
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#8e8e93",
  },
});
