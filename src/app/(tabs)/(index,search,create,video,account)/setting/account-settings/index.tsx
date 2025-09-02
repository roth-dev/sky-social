import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, ScrollView, Switch, Share, Pressable } from "react-native";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Text, View, Dialog } from "@/components/ui";
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
  Eye,
  EyeOff,
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
  const { user, logout } = useAuth();
  const { isDarkMode } = useSettings();
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    likes: true,
    reposts: true,
    mentions: true,
    follows: true,
    posts: true,
  });

  // Load notification settings
  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem("notification_settings");
      if (saved) {
        setNotificationSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error);
    }
  };

  const saveNotificationSettings = async (
    newSettings: typeof notificationSettings
  ) => {
    try {
      await AsyncStorage.setItem(
        "notification_settings",
        JSON.stringify(newSettings)
      );
      setNotificationSettings(newSettings);
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      Dialog.show(t`Error`, t`Failed to save notification settings`);
    }
  };

  const handleExportData = useCallback(async () => {
    try {
      // Simulate data export
      const userData = {
        profile: {
          handle: user?.handle,
          displayName: user?.displayName,
          description: user?.description,
          createdAt: user?.createdAt,
        },
        settings: notificationSettings,
        exportedAt: new Date().toISOString(),
      };

      const dataString = JSON.stringify(userData, null, 2);

      // Use Share API to export data
      await Share.share({
        message: dataString,
        title: t`Sky Social Data Export`,
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      Dialog.show(t`Error`, t`Failed to export your data`);
    }
  }, [user, notificationSettings]);

  const handleDeleteAccount = useCallback(() => {
    Dialog.show(
      t`Delete Account`,
      t`Are you sure you want to delete your account? This action cannot be undone.`,
      [
        { text: t`Cancel`, style: "cancel" },
        {
          text: t`Delete`,
          style: "destructive",
          onPress: () => {
            Dialog.show(
              t`Final Confirmation`,
              t`This will permanently delete your account and all associated data. Type "DELETE" to confirm.`,
              [
                { text: t`Cancel`, style: "cancel" },
                {
                  text: t`Confirm Delete`,
                  style: "destructive",
                  onPress: async () => {
                    try {
                      // TODO: Implement actual account deletion
                      await logout();
                      router.replace("/login");
                    } catch (error) {
                      console.error("Failed to delete account:", error);
                      Dialog.show(t`Error`, t`Failed to delete account`);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [logout]);

  const handleChangePassword = useCallback(() => {
    Dialog.show(t`Change Password`, t`This feature will be available soon.`);
  }, []);

  const handleChangeEmail = useCallback(() => {
    Dialog.show(t`Change Email`, t`This feature will be available soon.`);
  }, []);

  const handleTwoFactorAuth = useCallback(() => {
    Dialog.show(
      t`Two-Factor Authentication`,
      t`This feature will be available soon.`
    );
  }, []);

  const handleCopyHandle = useCallback(async () => {
    if (user?.handle) {
      try {
        // Use Share API as a fallback for copying
        await Share.share({
          message: user.handle,
        });
      } catch (error) {
        console.error("Failed to copy handle:", error);
      }
    }
  }, [user?.handle]);

  const sections: AccountSection[] = [
    {
      id: "profile",
      title: t`Profile Information`,
      items: [
        {
          id: "handle",
          title: t`Handle`,
          description: showSensitiveInfo ? user?.handle : "●●●●●●●●",
          type: "info",
          icon: <User size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
          onPress: handleCopyHandle,
        },
        {
          id: "email",
          title: t`Email`,
          description: showSensitiveInfo
            ? "user@example.com"
            : "●●●●●●●●@●●●●●.com",
          type: "navigation",
          icon: <Mail size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
          onPress: handleChangeEmail,
        },
        {
          id: "show_sensitive",
          title: t`Show Sensitive Information`,
          type: "toggle",
          icon: showSensitiveInfo ? (
            <Eye size={20} color={isDarkMode ? "#ffffff" : "#000000"} />
          ) : (
            <EyeOff size={20} color={isDarkMode ? "#ffffff" : "#000000"} />
          ),
          value: showSensitiveInfo,
          onToggle: setShowSensitiveInfo,
        },
      ],
    },
    {
      id: "security",
      title: t`Security`,
      items: [
        {
          id: "change_password",
          title: t`Change Password`,
          type: "navigation",
          icon: <Key size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
          onPress: handleChangePassword,
        },
        {
          id: "two_factor",
          title: t`Two-Factor Authentication`,
          description: t`Not enabled`,
          type: "navigation",
          icon: <Shield size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
          onPress: handleTwoFactorAuth,
        },
      ],
    },
    {
      id: "notifications",
      title: t`Notification Preferences`,
      items: [
        {
          id: "likes",
          title: t`Likes`,
          type: "toggle",
          icon: <Bell size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
          value: notificationSettings.likes,
          onToggle: (value) =>
            saveNotificationSettings({ ...notificationSettings, likes: value }),
        },
        {
          id: "reposts",
          title: t`Reposts`,
          type: "toggle",
          icon: <Bell size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
          value: notificationSettings.reposts,
          onToggle: (value) =>
            saveNotificationSettings({
              ...notificationSettings,
              reposts: value,
            }),
        },
        {
          id: "mentions",
          title: t`Mentions`,
          type: "toggle",
          icon: <Bell size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
          value: notificationSettings.mentions,
          onToggle: (value) =>
            saveNotificationSettings({
              ...notificationSettings,
              mentions: value,
            }),
        },
        {
          id: "follows",
          title: t`New Followers`,
          type: "toggle",
          icon: <Bell size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
          value: notificationSettings.follows,
          onToggle: (value) =>
            saveNotificationSettings({
              ...notificationSettings,
              follows: value,
            }),
        },
        {
          id: "posts",
          title: t`Posts from Following`,
          type: "toggle",
          icon: <Bell size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
          value: notificationSettings.posts,
          onToggle: (value) =>
            saveNotificationSettings({ ...notificationSettings, posts: value }),
        },
      ],
    },
    {
      id: "data",
      title: t`Data Management`,
      items: [
        {
          id: "export",
          title: t`Export Data`,
          description: t`Download a copy of your data`,
          type: "button",
          icon: (
            <Download size={20} color={isDarkMode ? "#ffffff" : "#000000"} />
          ),
          onPress: handleExportData,
        },
        {
          id: "import",
          title: t`Import Data`,
          description: t`Restore from backup`,
          type: "button",
          icon: <Upload size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
          onPress: () =>
            Dialog.show(
              t`Import Data`,
              t`This feature will be available soon.`
            ),
        },
      ],
    },
    {
      id: "danger",
      title: t`Danger Zone`,
      items: [
        {
          id: "delete",
          title: t`Delete Account`,
          description: t`Permanently delete your account`,
          type: "button",
          icon: <Trash2 size={20} color="#ff6b6b" />,
          onPress: handleDeleteAccount,
          destructive: true,
        },
      ],
    },
  ];

  const renderSetting = (setting: AccountSetting) => {
    const isDestructive = setting.destructive;
    const textColor = isDestructive
      ? "#ff6b6b"
      : isDarkMode
      ? "#ffffff"
      : "#000000";

    return (
      <Pressable
        key={setting.id}
        style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
        onPress={setting.onPress}
        disabled={setting.type === "toggle"}
      >
        <View style={styles.settingIcon}>{setting.icon}</View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: textColor }]}>
            {setting.title}
          </Text>
          {setting.description && (
            <Text
              style={[styles.settingDescription, isDarkMode && styles.darkText]}
            >
              {setting.description}
            </Text>
          )}
        </View>
        {setting.type === "toggle" && (
          <Switch
            value={setting.value as boolean}
            onValueChange={setting.onToggle}
            trackColor={{ false: "#767577", true: "#1DA1F2" }}
            thumbColor={setting.value ? "#ffffff" : "#f4f3f4"}
          />
        )}
        {(setting.type === "navigation" || setting.type === "button") && (
          <View style={styles.chevron}>
            <Text style={[styles.chevronText, isDarkMode && styles.darkText]}>
              {setting.type === "navigation" ? ">" : ""}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderSection = (section: AccountSection) => (
    <View
      key={section.id}
      style={[styles.section, isDarkMode && styles.darkSection]}
    >
      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
        {section.title}
      </Text>
      {section.items.map(renderSetting)}
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Header title={t`Account Settings`} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
            <Trans>Manage Your Account</Trans>
          </Text>
          <Text
            style={[
              styles.headerDescription,
              isDarkMode && styles.darkSecondaryText,
            ]}
          >
            <Trans>
              Configure your profile, security, and privacy settings
            </Trans>
          </Text>
        </View>

        {sections.map(renderSection)}

        <View style={styles.footer}>
          <Text
            style={[styles.footerText, isDarkMode && styles.darkSecondaryText]}
          >
            <Trans>
              Your privacy and security are important to us. All changes are
              saved automatically.
            </Trans>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    overflow: "hidden",
  },
  darkSection: {
    backgroundColor: "#1a1a1a",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  darkSettingItem: {
    backgroundColor: "#2a2a2a",
    borderBottomColor: "#3a3a3a",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 18,
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 18,
    color: "#666666",
    fontWeight: "300",
  },
  footer: {
    padding: 20,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#999999",
  },
});
