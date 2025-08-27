import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings, Language, ThemeMode } from "@/contexts/SettingsContext";
import { useI18n } from "@/contexts/I18nProvider";
import { router } from "expo-router";

export function useSettingsActions() {
  const { logout } = useAuth();
  const { language, themeMode, setLanguage, setThemeMode } = useSettings();
  const { changeLocale } = useI18n();

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const handleAddAccount = () => {
    // Navigate to add account screen
    router.push("/add-account");
  };

  const handleGrayskyPro = () => {
    Alert.alert("Graysky Pro", "Premium features coming soon!", [
      { text: "OK" },
    ]);
  };

  const handleLanguage = () => {
    router.push("/language-settings");
  };

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    changeLocale(selectedLanguage);
    setShowLanguageModal(false);
  };

  const handleThemeSelect = (selectedTheme: ThemeMode) => {
    setThemeMode(selectedTheme);
    setShowThemeModal(false);
  };

  const handleAccount = () => {
    router.push("/account-settings");
  };

  const handleModeration = () => {
    router.push("/moderation");
  };

  const handleHomeFeedPreferences = () => {
    router.push("/home-feed-preferences");
  };

  const handleAppSettings = () => {
    router.push("/app-settings");
  };

  const handleAbout = () => {
    Alert.alert(
      "About Graysky",
      "Sky Social v1.0.0\nBuilt with AT Protocol\n\nA modern social media client for the decentralized web.",
      [{ text: "OK" }]
    );
  };

  const getLanguageDisplayName = (lang: Language) => {
    return lang === "en" ? "English" : "Khmer";
  };

  const getThemeDisplayName = (theme: ThemeMode) => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return theme;
    }
  };

  const handleThemePress = () => {
    router.push("/theme-settings");
  };

  return {
    // State
    language,
    themeMode,
    showLanguageModal,
    showThemeModal,

    // Actions
    handleSignOut,
    handleAddAccount,
    handleGrayskyPro,
    handleLanguage,
    handleLanguageSelect,
    handleThemeSelect,
    handleThemePress,
    handleAccount,
    handleModeration,
    handleHomeFeedPreferences,
    handleAppSettings,
    handleAbout,

    // Modal controls
    setShowLanguageModal,
    setShowThemeModal,

    // Helpers
    getLanguageDisplayName,
    getThemeDisplayName,
  };
}
