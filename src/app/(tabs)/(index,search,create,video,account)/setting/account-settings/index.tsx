import React, { useState, useCallback, useEffect } from "react";
import { ScrollView, Share } from "react-native";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Text, View, Dialog, SettingsSection } from "@/components/ui";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import type { SettingsItemProps } from "@/components/ui/SettingsItem";
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

  const profileSection: SettingsItemProps[] = [
    {
      title: t`Handle`,
      description: showSensitiveInfo ? user?.handle : "●●●●●●●●",
      type: "info",
      icon: <User size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
      onPress: handleCopyHandle,
    },
    {
      title: t`Email`,
      description: showSensitiveInfo
        ? "user@example.com"
        : "●●●●●●●●@●●●●●.com",
      type: "navigation",
      icon: <Mail size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
      onPress: handleChangeEmail,
    },
    {
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
  ];

  const securitySection: SettingsItemProps[] = [
    {
      title: t`Change Password`,
      type: "navigation",
      icon: <Key size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
      onPress: handleChangePassword,
    },
    {
      title: t`Two-Factor Authentication`,
      description: t`Not enabled`,
      type: "navigation",
      icon: <Shield size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
      onPress: handleTwoFactorAuth,
    },
  ];

  const notificationsSection: SettingsItemProps[] = [
    {
      title: t`Likes`,
      type: "toggle",
      icon: <Bell size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
      value: notificationSettings.likes,
      onToggle: (value: boolean) =>
        saveNotificationSettings({ ...notificationSettings, likes: value }),
    },
    {
      title: t`Reposts`,
      type: "toggle",
      icon: <Bell size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
      value: notificationSettings.reposts,
      onToggle: (value: boolean) =>
        saveNotificationSettings({
          ...notificationSettings,
          reposts: value,
        }),
    },
    {
      title: t`Mentions`,
      type: "toggle",
      icon: <Bell size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
      value: notificationSettings.mentions,
      onToggle: (value: boolean) =>
        saveNotificationSettings({
          ...notificationSettings,
          mentions: value,
        }),
    },
    {
      title: t`New Followers`,
      type: "toggle",
      icon: <Bell size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
      value: notificationSettings.follows,
      onToggle: (value: boolean) =>
        saveNotificationSettings({
          ...notificationSettings,
          follows: value,
        }),
    },
    {
      title: t`Posts from Following`,
      type: "toggle",
      icon: <Bell size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
      value: notificationSettings.posts,
      onToggle: (value: boolean) =>
        saveNotificationSettings({ ...notificationSettings, posts: value }),
    },
  ];

  const dataSection: SettingsItemProps[] = [
    {
      title: t`Export Data`,
      description: t`Download a copy of your data`,
      type: "button",
      icon: <Download size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
      onPress: handleExportData,
    },
    {
      title: t`Import Data`,
      description: t`Restore from backup`,
      type: "button",
      icon: <Upload size={20} color={isDarkMode ? "#ffffff" : "#000000"} />,
      onPress: () =>
        Dialog.show(t`Import Data`, t`This feature will be available soon.`),
    },
  ];

  const dangerSection: SettingsItemProps[] = [
    {
      title: t`Delete Account`,
      description: t`Permanently delete your account`,
      type: "button",
      icon: <Trash2 size={20} color="#ff6b6b" />,
      onPress: handleDeleteAccount,
      destructive: true,
    },
  ];

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <Header title={t`Account Settings`} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            <Trans>Manage Your Account</Trans>
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            <Trans>
              Configure your profile, security, and privacy settings
            </Trans>
          </Text>
        </View>

        <SettingsSection
          title={t`Profile Information`}
          items={profileSection}
        />
        <SettingsSection title={t`Security`} items={securitySection} />
        <SettingsSection
          title={t`Notification Preferences`}
          items={notificationsSection}
        />
        <SettingsSection title={t`Data Management`} items={dataSection} />
        <SettingsSection title={t`Danger Zone`} items={dangerSection} />

        <View className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <Text className="text-sm text-gray-600 dark:text-gray-300 text-center">
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
