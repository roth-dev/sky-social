import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Share,
  Pressable,
} from "react-native";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Text, View } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import {
  User,
  Shield,
  Mail,
  Key,
  Bell,
  Download,
  Upload,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Info,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

interface AccountSetting {
  id: string;
  title: string;
  description?: string;
  type: "toggle" | "button" | "info" | "navigation";
  icon: React.ReactNode;
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => Promise<void> | void;
  destructive?: boolean;
  sensitive?: boolean;
}

interface AccountSection {
  id: string;
  title: string;
  items: AccountSetting[];
}

export default function AccountSettingsScreen() {
  const { user } = useAuth();
  const { isDarkMode } = useSettings();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [dataExporting, setDataExporting] = useState(false);

  const loadAccountSettings = useCallback(async () => {
    try {
      const settings = await AsyncStorage.multiGet([
        "emailNotifications",
        "pushNotifications",
        "twoFactorEnabled",
      ]);

      settings.forEach(([key, value]) => {
        if (value !== null) {
          const boolValue = value === "true";
          switch (key) {
            case "emailNotifications":
              setEmailNotifications(boolValue);
              break;
            case "pushNotifications":
              setPushNotifications(boolValue);
              break;
            case "twoFactorEnabled":
              setTwoFactorEnabled(boolValue);
              break;
          }
        }
      });
    } catch (error) {
      console.error("Failed to load account settings:", error);
    }
  }, []);

  // Load account settings on mount
  useEffect(() => {
    loadAccountSettings();
  }, [loadAccountSettings]);

  const saveSetting = useCallback(async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      Alert.alert("Error", `Failed to save ${key} setting`);
    }
  }, []);

  const handleEmailNotifications = useCallback(
    async (value: boolean) => {
      setEmailNotifications(value);
      await saveSetting("emailNotifications", value);

      if (value) {
        Alert.alert(
          "Email Notifications",
          "Email notifications have been enabled."
        );
      } else {
        Alert.alert(
          "Email Notifications",
          "Email notifications have been disabled."
        );
      }
    },
    [saveSetting]
  );

  const handlePushNotifications = useCallback(
    async (value: boolean) => {
      setPushNotifications(value);
      await saveSetting("pushNotifications", value);

      if (value) {
        Alert.alert(
          "Push Notifications",
          "Push notifications have been enabled."
        );
      } else {
        Alert.alert(
          "Push Notifications",
          "Push notifications have been disabled."
        );
      }
    },
    [saveSetting]
  );

  const handleTwoFactor = useCallback(
    async (value: boolean) => {
      if (value) {
        Alert.alert(
          "Enable Two-Factor Authentication",
          "Two-factor authentication adds an extra layer of security to your account. Would you like to enable it?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Enable",
              onPress: async () => {
                setTwoFactorEnabled(true);
                await saveSetting("twoFactorEnabled", true);
                Alert.alert(
                  "Success",
                  "Two-factor authentication has been enabled."
                );
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Disable Two-Factor Authentication",
          "This will make your account less secure. Are you sure?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Disable",
              style: "destructive",
              onPress: async () => {
                setTwoFactorEnabled(false);
                await saveSetting("twoFactorEnabled", false);
                Alert.alert(
                  "Disabled",
                  "Two-factor authentication has been disabled."
                );
              },
            },
          ]
        );
      }
    },
    [saveSetting]
  );

  const handleChangeEmail = useCallback(() => {
    Alert.alert("Change Email", "Email change functionality coming soon!");
  }, []);

  const handleChangePassword = useCallback(() => {
    Alert.alert(
      "Change Password",
      "Password change functionality coming soon!"
    );
  }, []);

  const handlePrivacySettings = useCallback(() => {
    Alert.alert("Privacy Settings", "Privacy settings coming soon!");
  }, []);

  const handleExportData = useCallback(async () => {
    Alert.alert(
      "Export Account Data",
      "This will create a downloadable file containing all your account data. This may take a few minutes.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: async () => {
            try {
              setDataExporting(true);

              // Simulate data export process
              await new Promise((resolve) => setTimeout(resolve, 3000));

              const exportData = {
                user: user
                  ? {
                      handle: user.handle,
                      displayName: user.displayName,
                      description: user.description,
                      createdAt: new Date().toISOString(),
                    }
                  : null,
                settings: {
                  emailNotifications,
                  pushNotifications,
                  twoFactorEnabled,
                },
                exportedAt: new Date().toISOString(),
              };

              // In a real app, this would trigger a download
              await Share.share({
                message: `Sky Social Account Data Export\n\nExported at: ${new Date().toLocaleString()}\n\nData: ${JSON.stringify(
                  exportData,
                  null,
                  2
                )}`,
                title: "Account Data Export",
              });

              Alert.alert(
                "Success",
                "Your account data has been exported successfully."
              );
            } catch (error) {
              console.error("Failed to export data:", error);
              Alert.alert(
                "Error",
                "Failed to export account data. Please try again."
              );
            } finally {
              setDataExporting(false);
            }
          },
        },
      ]
    );
  }, [user, emailNotifications, pushNotifications, twoFactorEnabled]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted. Are you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "Type 'DELETE' to confirm account deletion:",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Forever",
                  style: "destructive",
                  onPress: () => {
                    // In a real app, this would call the deletion API
                    Alert.alert(
                      "Account Deletion",
                      "Account deletion functionality will be implemented in a future update."
                    );
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, []);

  const handleCopyUserId = useCallback(async () => {
    if (user?.did) {
      // Simulate copying to clipboard
      Alert.alert("Copied", "User ID copied to clipboard");
    }
  }, [user]);

  const handleCopyHandle = useCallback(async () => {
    if (user?.handle) {
      // Simulate copying to clipboard
      Alert.alert("Copied", "Handle copied to clipboard");
    }
  }, [user]);

  const sections: AccountSection[] = [
    {
      id: "profile",
      title: "Profile Information",
      items: [
        {
          id: "edit-profile",
          title: "Edit profile",
          description: "Update your display name, bio, and avatar",
          type: "navigation",
          icon: <User size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: () => router.push("/account-settings/edit-profile"),
        },
        {
          id: "user-id",
          title: "User ID",
          description: showSensitiveInfo
            ? user?.did || "Unknown"
            : "••••••••••••••••",
          type: "button",
          icon: <Copy size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleCopyUserId,
          sensitive: true,
        },
        {
          id: "handle",
          title: "Handle",
          description: user?.handle || "Unknown",
          type: "button",
          icon: <Copy size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleCopyHandle,
        },
      ],
    },
    {
      id: "security",
      title: "Security & Privacy",
      items: [
        {
          id: "change-email",
          title: "Change email",
          description: showSensitiveInfo
            ? "user@example.com"
            : "••••••••@••••••.com",
          type: "navigation",
          icon: <Mail size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleChangeEmail,
          sensitive: true,
        },
        {
          id: "change-password",
          title: "Change password",
          description: "Update your account password",
          type: "navigation",
          icon: <Key size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleChangePassword,
        },
        {
          id: "two-factor",
          title: "Two-factor authentication",
          description: "Add an extra layer of security",
          type: "toggle",
          icon: <Shield size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: twoFactorEnabled,
          onToggle: handleTwoFactor,
        },
        {
          id: "privacy-settings",
          title: "Privacy settings",
          description: "Control who can see your posts and profile",
          type: "navigation",
          icon: <Eye size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handlePrivacySettings,
        },
      ],
    },
    {
      id: "notifications",
      title: "Notifications",
      items: [
        {
          id: "email-notifications",
          title: "Email notifications",
          description: "Receive notifications via email",
          type: "toggle",
          icon: <Mail size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: emailNotifications,
          onToggle: handleEmailNotifications,
        },
        {
          id: "push-notifications",
          title: "Push notifications",
          description: "Receive push notifications on this device",
          type: "toggle",
          icon: <Bell size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: pushNotifications,
          onToggle: handlePushNotifications,
        },
      ],
    },
    {
      id: "data",
      title: "Data & Storage",
      items: [
        {
          id: "export-data",
          title: "Export account data",
          description: "Download a copy of your account data",
          type: "button",
          icon: (
            <Download size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
          onPress: handleExportData,
        },
        {
          id: "import-data",
          title: "Import data",
          description: "Import data from another account",
          type: "button",
          icon: <Upload size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: () => Alert.alert("Import Data", "Data import coming soon!"),
        },
      ],
    },
    {
      id: "danger",
      title: "Danger Zone",
      items: [
        {
          id: "delete-account",
          title: "Delete account",
          description: "Permanently delete your account and all data",
          type: "button",
          icon: <Trash2 size={20} color="#ff3b30" />,
          onPress: handleDeleteAccount,
          destructive: true,
        },
      ],
    },
  ];

  const renderSettingItem = (item: AccountSetting) => {
    return (
      <View
        key={item.id}
        style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
      >
        <View style={styles.settingContent}>
          <View style={styles.settingIcon}>{item.icon}</View>
          <View style={styles.settingText}>
            <Text
              style={[
                styles.settingTitle,
                isDarkMode && styles.darkText,
                item.destructive && styles.destructiveText,
              ]}
            >
              <Trans>{item.title}</Trans>
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.settingDescription,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>

        {item.type === "toggle" && (
          <Switch
            value={item.value as boolean}
            onValueChange={item.onToggle}
            thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
            trackColor={{
              false: isDarkMode ? "#39393d" : "#767577",
              true: "#007AFF",
            }}
          />
        )}

        {item.type === "button" && (
          <Button
            variant={item.destructive ? "destructive" : "secondary"}
            size="small"
            title={
              item.id === "export-data" && dataExporting
                ? "Exporting..."
                : item.id === "user-id" || item.id === "handle"
                ? "Copy"
                : "Manage"
            }
            onPress={item.onPress}
            disabled={item.id === "export-data" && dataExporting}
          />
        )}

        {item.type === "navigation" && (
          <Pressable onPress={item.onPress} style={styles.chevron}>
            <Text
              style={[
                styles.chevronText,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              ›
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  const renderSection = (section: AccountSection) => {
    return (
      <View key={section.id} style={styles.section}>
        <Text
          style={[styles.sectionTitle, isDarkMode && styles.darkSecondaryText]}
        >
          <Trans>{section.title}</Trans>
        </Text>
        <View
          style={[
            styles.sectionContent,
            isDarkMode && styles.darkSectionContent,
          ]}
        >
          {section.items.map((item, index) => (
            <View key={item.id}>
              {renderSettingItem(item)}
              {index < section.items.length - 1 && (
                <View
                  style={[styles.separator, isDarkMode && styles.darkSeparator]}
                />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Header title={t`Account Settings`} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Header */}
        {user && (
          <View style={styles.section}>
            <View style={[styles.userCard, isDarkMode && styles.darkUserCard]}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <User size={32} color={isDarkMode ? "#ffffff" : "#666666"} />
                </View>
                <View style={styles.userDetails}>
                  <Text
                    style={[styles.userName, isDarkMode && styles.darkText]}
                  >
                    {user.displayName || user.handle}
                  </Text>
                  <Text
                    style={[
                      styles.userHandle,
                      isDarkMode && styles.darkSecondaryText,
                    ]}
                  >
                    @{user.handle}
                  </Text>
                  {user.description && (
                    <Text
                      style={[
                        styles.userDescription,
                        isDarkMode && styles.darkSecondaryText,
                      ]}
                    >
                      {user.description}
                    </Text>
                  )}
                </View>
                <Button
                  variant="ghost"
                  size="small"
                  onPress={() => setShowSensitiveInfo(!showSensitiveInfo)}
                >
                  {showSensitiveInfo ? (
                    <EyeOff
                      size={20}
                      color={isDarkMode ? "#ffffff" : "#666666"}
                    />
                  ) : (
                    <Eye size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
                  )}
                </Button>
              </View>
            </View>
          </View>
        )}

        {/* Settings Sections */}
        {sections.map(renderSection)}

        {/* Security Info */}
        <View style={styles.section}>
          <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
            <Info size={20} color={isDarkMode ? "#007AFF" : "#007AFF"} />
            <Text
              style={[styles.infoText, isDarkMode && styles.darkSecondaryText]}
            >
              <Trans>
                Keep your account secure by enabling two-factor authentication
                and using a strong password.
              </Trans>
            </Text>
          </View>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8e8e93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 16,
  },
  sectionContent: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    overflow: "hidden",
  },
  darkSectionContent: {
    backgroundColor: "#1c1c1e",
  },
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
  },
  darkUserCard: {
    backgroundColor: "#1c1c1e",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: "#8e8e93",
    marginBottom: 4,
  },
  userDescription: {
    fontSize: 14,
    color: "#8e8e93",
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#ffffff",
  },
  darkSettingItem: {
    backgroundColor: "#1c1c1e",
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000000",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#8e8e93",
    lineHeight: 18,
  },
  destructiveText: {
    color: "#ff3b30",
  },
  separator: {
    height: 1,
    backgroundColor: "#c6c6c8",
    marginLeft: 48,
  },
  darkSeparator: {
    backgroundColor: "#38383a",
  },
  chevron: {
    paddingLeft: 8,
  },
  chevronText: {
    fontSize: 18,
    color: "#c6c6c8",
    fontWeight: "300",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  darkInfoCard: {
    backgroundColor: "#1c1c1e",
  },
  infoText: {
    fontSize: 14,
    color: "#8e8e93",
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#8e8e93",
  },
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#8e8e93",
  },
});
