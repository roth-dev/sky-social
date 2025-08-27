import React from "react";
import { StyleSheet, ScrollView, Platform } from "react-native";
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
} from "lucide-react-native";
import { router } from "expo-router";
import {
  SettingsHeader,
  AddAccountSection,
  SettingsSection,
  ThemeSettingsItem,
  type SettingsSectionData,
} from "@/components/settings";
import { useSettingsActions } from "@/hooks/useSettingsActions";
import { View } from "@/components/ui";
import { t } from "@lingui/core/macro";

export default function SettingsScreen() {
  const { isAuthenticated, user } = useAuth();
  const { isDarkMode, themeMode } = useSettings();

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
  const sections: SettingsSectionData[] = [];

  // Account section (for authenticated users)
  if (isAuthenticated) {
    sections.push({
      id: "account",
      title: "",
      items: [
        {
          id: "account-settings",
          icon: <User size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          title: t`Account`,
          onPress: handleAccount,
          showChevron: true,
        },
        {
          id: "moderation",
          icon: <Shield size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          title: t`Moderation`,
          onPress: handleModeration,
          showChevron: true,
        },
        {
          id: "home-feed",
          icon: <Home size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          title: t`Home feed preferences`,
          onPress: handleHomeFeedPreferences,
          showChevron: true,
        },
      ],
    });
  }

  // General settings
  sections.push({
    id: "general",
    title: "",
    items: [
      {
        id: "languages",
        icon: <Globe size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
        title: t`Languages`,
        value: getLanguageDisplayName(language),
        onPress: handleLanguage,
        showChevron: true,
      },
      {
        id: "app-settings",
        icon: (
          <Smartphone size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
        ),
        title: t`App settings`,
        onPress: handleAppSettings,
        showChevron: true,
      },
    ],
  });

  // About section
  sections.push({
    id: "about",
    title: "",
    items: [
      {
        id: "about",
        icon: <Info size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
        title: t`About`,
        onPress: handleAbout,
        showChevron: true,
      },
    ],
  });

  return (
    <View className="flex-1">
      {Platform.OS !== "web" && <Header title={t`Settings`} />}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        {isAuthenticated && user && (
          <SettingsHeader
            user={user}
            onSignOut={handleSignOut}
            onProfilePress={() => {
              router.push("/setting/accounts");
            }}
          />
        )}

        {/* Add Account Section */}
        {isAuthenticated && (
          <AddAccountSection onAddAccount={handleAddAccount} />
        )}

        {/* Theme Section */}
        <View>
          <ThemeSettingsItem
            onPress={handleThemePress}
            currentTheme={themeMode}
          />
        </View>

        {/* Settings Sections */}
        {sections.map((section) => (
          <SettingsSection key={section.id} section={section} />
        ))}

        {/* Sign In Prompt for Unauthenticated Users */}
        {!isAuthenticated && (
          <View
          // style={[
          //   styles.signInSection,
          //   isDarkMode && styles.darkSignInSection,
          // ]}
          >
            <Button
              title={t`Sign in`}
              onPress={() => router.push("/login")}
              variant="primary"
              size="large"
              style={styles.signInButton}
            />
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
  content: {
    flex: 1,
  },
  themeSection: {
    marginBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    borderBottomColor: "#e5e7eb",
  },
  darkThemeSection: {
    borderTopColor: "#333333",
    borderBottomColor: "#333333",
  },
  signInSection: {
    margin: 16,
    padding: 24,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    borderBottomColor: "#e5e7eb",
  },
  darkSignInSection: {
    backgroundColor: "#000000",
    borderTopColor: "#333333",
    borderBottomColor: "#333333",
  },
  signInButton: {
    paddingHorizontal: 32,
    minWidth: 200,
  },
});
