import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { storage, type AccountData } from "@/lib/storage";
import { ChevronRight, Plus, Trash2 } from "lucide-react-native";
import { Trans } from "@lingui/react/macro";
import { Text } from "../ui";

interface AccountSelectorProps {
  onAddAccount: () => void;
}

export function AccountSelector({ onAddAccount }: AccountSelectorProps) {
  const { isDarkMode } = useSettings();
  const { user: currentUser, refreshUser } = useAuth();
  const [accounts, setAccounts] = useState<{ [did: string]: AccountData }>({});
  const [activeAccountDid, setActiveAccountDid] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const storedAccounts = await storage.getAccounts();
      const activeDid = await storage.getActiveAccount();
      setAccounts(storedAccounts);
      setActiveAccountDid(activeDid);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  const handleSwitchAccount = async (did: string) => {
    try {
      const accountData = await storage.switchAccount(did);
      if (accountData) {
        await refreshUser();
        setActiveAccountDid(did);
        Alert.alert(
          "Account Switched",
          `Switched to ${
            accountData.profile.displayName || accountData.profile.handle
          }`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Failed to switch account:", error);
      Alert.alert("Error", "Failed to switch account. Please try again.");
    }
  };

  const handleRemoveAccount = async (did: string, accountData: AccountData) => {
    const accountName =
      accountData.profile.displayName || accountData.profile.handle;

    Alert.alert(
      "Remove Account",
      `Are you sure you want to remove ${accountName}? You'll need to sign in again to add it back.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await storage.removeAccount(did);
              await loadAccounts();

              // If we removed the active account, refresh to show logged out state
              if (did === activeAccountDid) {
                await refreshUser();
              }
            } catch (error) {
              console.error("Failed to remove account:", error);
              Alert.alert(
                "Error",
                "Failed to remove account. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const accountEntries = Object.entries(accounts);
  const hasMultipleAccounts = accountEntries.length > 1;

  return (
    <View style={styles.container}>
      {/* Current Account */}
      {currentUser && (
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode && styles.darkSecondaryText,
            ]}
          >
            <Trans>Current Account</Trans>
          </Text>
          <View
            style={[styles.accountCard, isDarkMode && styles.darkAccountCard]}
          >
            <Avatar
              uri={currentUser.avatar}
              size="medium"
              fallbackText={currentUser.displayName || currentUser.handle}
            />
            <View style={styles.accountInfo}>
              <Text style={[styles.accountName, isDarkMode && styles.darkText]}>
                {currentUser.displayName || currentUser.handle}
              </Text>
              <Text
                style={[
                  styles.accountHandle,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                @{currentUser.handle}
              </Text>
            </View>
            <View
              style={[styles.activeBadge, isDarkMode && styles.darkActiveBadge]}
            >
              <Text
                style={[
                  styles.activeBadgeText,
                  isDarkMode && styles.darkActiveBadgeText,
                ]}
              >
                <Trans>Active</Trans>
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Other Accounts */}
      {hasMultipleAccounts && (
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode && styles.darkSecondaryText,
            ]}
          >
            <Trans>Switch to Account</Trans>
          </Text>
          {accountEntries
            .filter(([did]) => did !== activeAccountDid)
            .map(([did, accountData]) => (
              <TouchableOpacity
                key={did}
                style={[
                  styles.accountCard,
                  isDarkMode && styles.darkAccountCard,
                ]}
                onPress={() => handleSwitchAccount(did)}
                activeOpacity={0.7}
              >
                <Avatar
                  uri={accountData.profile.avatar}
                  size="medium"
                  fallbackText={
                    accountData.profile.displayName ||
                    accountData.profile.handle
                  }
                />
                <View style={styles.accountInfo}>
                  <Text
                    style={[styles.accountName, isDarkMode && styles.darkText]}
                  >
                    {accountData.profile.displayName ||
                      accountData.profile.handle}
                  </Text>
                  <Text
                    style={[
                      styles.accountHandle,
                      isDarkMode && styles.darkSecondaryText,
                    ]}
                  >
                    @{accountData.profile.handle}
                  </Text>
                </View>
                <View style={styles.accountActions}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveAccount(did, accountData);
                    }}
                  >
                    <Trash2
                      size={16}
                      color={isDarkMode ? "#ff453a" : "#ff3b30"}
                    />
                  </TouchableOpacity>
                  <ChevronRight
                    size={16}
                    color={isDarkMode ? "#666666" : "#999999"}
                  />
                </View>
              </TouchableOpacity>
            ))}
        </View>
      )}

      {/* Add Account */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[
            styles.addAccountCard,
            isDarkMode && styles.darkAddAccountCard,
          ]}
          onPress={onAddAccount}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.addAccountIcon,
              isDarkMode && styles.darkAddAccountIcon,
            ]}
          >
            <Plus size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          </View>
          <Text style={[styles.addAccountText, isDarkMode && styles.darkText]}>
            <Trans>Add another account</Trans>
          </Text>
          <ChevronRight size={16} color={isDarkMode ? "#666666" : "#999999"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    borderBottomColor: "#e5e7eb",
  },
  darkAccountCard: {
    backgroundColor: "#000000",
    borderTopColor: "#333333",
    borderBottomColor: "#333333",
  },
  accountInfo: {
    flex: 1,
    marginLeft: 12,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  accountHandle: {
    fontSize: 14,
    color: "#666666",
  },
  accountActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  removeButton: {
    padding: 4,
  },
  activeBadge: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  darkActiveBadge: {
    backgroundColor: "#0A84FF",
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  darkActiveBadgeText: {
    color: "#ffffff",
  },
  addAccountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    borderBottomColor: "#e5e7eb",
  },
  darkAddAccountCard: {
    backgroundColor: "#000000",
    borderTopColor: "#333333",
    borderBottomColor: "#333333",
  },
  addAccountIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  darkAddAccountIcon: {
    backgroundColor: "#333333",
  },
  addAccountText: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    fontWeight: "400",
  },
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#999999",
  },
});
