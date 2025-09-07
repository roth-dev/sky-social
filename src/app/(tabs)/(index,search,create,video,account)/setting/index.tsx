import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/Button";
import {
  Globe,
  User,
  Shield,
  Home,
  Smartphone,
  Info,
  ChevronRight,
  Plus,
} from "lucide-react-native";
import { router } from "expo-router";
import { SettingsSection } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";
import type { SettingsItemProps } from "@/components/ui/SettingsItem";
import { useSettingsActions } from "@/hooks/useSettingsActions";
import { View, Text } from "@/components/ui";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { isNative } from "@/platform";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function SettingsScreen() {
  const { isAuthenticated, user } = useAuth();
  const { isDarkMode, themeMode } = useSettings();
  const bottomTabBarHeight = useBottomTabBarHeight();

  const {
    language,
    handleSignOut,
    handleAddAccount,
    handleLanguage,
    handleThemePress,
    handleAccount,
    handleModeration,
    handleHomeFeedPreferences,
    handleAppSettings,
    handleAbout,
    getLanguageDisplayName,
  } = useSettingsActions();

  // Build settings sections
  const sections: { title: string; items: SettingsItemProps[] }[] = [];

  // Account section (for authenticated users)
  if (isAuthenticated) {
    sections.push({
      title: t`Account`,
      items: [
        {
          title: t`Account`,
          type: "navigation" as const,
          icon: <User size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleAccount,
        },
        {
          title: t`Moderation`,
          type: "navigation" as const,
          icon: <Shield size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleModeration,
        },
        {
          title: t`Home feed preferences`,
          type: "navigation" as const,
          icon: <Home size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleHomeFeedPreferences,
        },
      ],
    });
  }

  // General settings
  sections.push({
    title: t`General`,
    items: [
      {
        title: t`Languages`,
        type: "navigation" as const,
        icon: <Globe size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
        value: getLanguageDisplayName(language),
        onPress: handleLanguage,
      },
      {
        title: t`App settings`,
        type: "navigation" as const,
        icon: (
          <Smartphone size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
        ),
        onPress: handleAppSettings,
      },
    ],
  });

  // Appearance section
  sections.push({
    title: t`Appearance`,
    items: [
      {
        title: t`Theme`,
        type: "navigation" as const,
        icon: (
          <Smartphone size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
        ),
        value: themeMode,
        onPress: handleThemePress,
      },
    ],
  });

  // About section
  sections.push({
    title: t`Support`,
    items: [
      {
        title: t`About`,
        type: "navigation" as const,
        icon: <Info size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
        onPress: handleAbout,
      },
    ],
  });

  return (
    <View className="flex-1">
      <Header title={t`Settings`} disabledLeft={!isNative} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4"
        contentContainerStyle={{ paddingBottom: bottomTabBarHeight }}
      >
        {/* User Profile Section */}
        {isAuthenticated && user && (
          <View
            darkColor="secondary"
            className="bg-white px-4 py-3 rounded-md mb-6"
          >
            <TouchableOpacity
              className="flex-row items-center py-2"
              onPress={() => router.push("/setting/accounts")}
              activeOpacity={0.7}
            >
              <Avatar
                uri={user.avatar}
                size="large"
                fallbackText={user.displayName || user.handle}
              />
              <View darkColor="none" className="flex-1 ml-3">
                <Text className="text-lg font-semibold text-black dark:text-white mb-1">
                  {user.displayName || user.handle}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  @{user.handle}
                </Text>
              </View>
              <TouchableOpacity
                className="px-4 py-2 rounded-lg"
                onPress={handleSignOut}
              >
                <Text className="text-base text-blue-500 font-medium">
                  <Trans>Sign out</Trans>
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={handleAddAccount}
              activeOpacity={0.7}
            >
              <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
                <Plus size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
              </View>
              <Text className="flex-1">
                <Trans>Add another account</Trans>
              </Text>
              <ChevronRight
                size={16}
                color={isDarkMode ? "#666666" : "#999999"}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Settings Sections */}
        {sections.map((section, index) => (
          <SettingsSection
            key={index}
            title={section.title}
            items={section.items}
          />
        ))}

        {/* Sign In Prompt for Unauthenticated Users */}
        {!isAuthenticated && (
          <View className="mx-4 mt-4 p-6 bg-white dark:bg-gray-800 rounded-xl items-center">
            <Button
              title={t`Sign in`}
              onPress={() => router.push("/login")}
              variant="primary"
              size="large"
              className="px-8 min-w-48"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
