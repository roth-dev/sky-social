import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings, Language, ThemeMode } from "@/contexts/SettingsContext";
import { useTranslation } from "@/contexts/I18nContext";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Settings as SettingsIcon,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Globe,
  User,
  Shield,
  Bell,
  Info,
  LogOut,
  Check,
  ArrowLeft,
} from "lucide-react-native";
import { router } from "expo-router";

interface SettingItem {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

interface SettingSection {
  titleKey: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const { isAuthenticated, user, logout } = useAuth();
  const { language, themeMode, isDarkMode, setLanguage, setThemeMode } =
    useSettings();
  const { t } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const handleLogout = () => {
    Alert.alert(t("settings.logout"), "Are you sure you want to sign out?", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.logout"),
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setShowLanguageModal(false);
  };

  const handleThemeSelect = (selectedTheme: ThemeMode) => {
    setThemeMode(selectedTheme);
    setShowThemeModal(false);
  };

  const getLanguageDisplayName = (lang: Language) => {
    return lang === "en"
      ? t("settings.language.english")
      : t("settings.language.khmer");
  };

  const getThemeDisplayName = (theme: ThemeMode) => {
    switch (theme) {
      case "light":
        return t("settings.theme.light");
      case "dark":
        return t("settings.theme.dark");
      case "system":
        return t("settings.theme.system");
      default:
        return theme;
    }
  };

  const getThemeIcon = (theme: ThemeMode) => {
    switch (theme) {
      case "light":
        return <Sun size={20} color="#f59e0b" />;
      case "dark":
        return <Moon size={20} color="#6366f1" />;
      case "system":
        return <Monitor size={20} color="#6b7280" />;
      default:
        return <Monitor size={20} color="#6b7280" />;
    }
  };

  const sections: SettingSection[] = [
    {
      titleKey: "settings.appearance",
      items: [
        {
          id: "language",
          icon: <Globe size={20} color="#6b7280" />,
          titleKey: "settings.language",
          value: getLanguageDisplayName(language),
          onPress: () => setShowLanguageModal(true),
          showChevron: true,
        },
        {
          id: "theme",
          icon: getThemeIcon(themeMode),
          titleKey: "settings.theme",
          value: getThemeDisplayName(themeMode),
          onPress: () => setShowThemeModal(true),
          showChevron: true,
        },
      ],
    },
  ];

  if (isAuthenticated) {
    sections.push(
      {
        titleKey: "settings.account",
        items: [
          {
            id: "privacy",
            icon: <Shield size={20} color="#6b7280" />,
            titleKey: "settings.privacy",
            onPress: () =>
              Alert.alert(
                "Coming Soon",
                "Privacy settings will be available soon!"
              ),
            showChevron: true,
          },
          {
            id: "notifications",
            icon: <Bell size={20} color="#6b7280" />,
            titleKey: "settings.notifications",
            onPress: () =>
              Alert.alert(
                "Coming Soon",
                "Notification settings will be available soon!"
              ),
            showChevron: true,
          },
        ],
      },
      {
        titleKey: "settings.about",
        items: [
          {
            id: "about",
            icon: <Info size={20} color="#6b7280" />,
            titleKey: "settings.about",
            onPress: () =>
              Alert.alert(
                "Sky Social",
                "Version 1.0.0\nBuilt with AT Protocol"
              ),
            showChevron: true,
          },
          {
            id: "logout",
            icon: <LogOut size={20} color="#ef4444" />,
            titleKey: "settings.logout",
            onPress: handleLogout,
            destructive: true,
          },
        ],
      }
    );
  } else {
    sections.push({
      titleKey: "settings.about",
      items: [
        {
          id: "about",
          icon: <Info size={20} color="#6b7280" />,
          titleKey: "settings.about",
          onPress: () =>
            Alert.alert("Sky Social", "Version 1.0.0\nBuilt with AT Protocol"),
          showChevron: true,
        },
      ],
    });
  }

  const renderLanguageModal = () => {
    const languages: { code: Language; nameKey: string }[] = [
      { code: "en", nameKey: "settings.language.english" },
      { code: "km", nameKey: "settings.language.khmer" },
    ];

    return (
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View
          style={[styles.modalOverlay, isDarkMode && styles.darkModalOverlay]}
        >
          <View
            style={[styles.modalContent, isDarkMode && styles.darkModalContent]}
          >
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              {t("settings.language")}
            </Text>

            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.modalOption,
                  isDarkMode && styles.darkModalOption,
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    isDarkMode && styles.darkText,
                  ]}
                >
                  {t(lang.nameKey)}
                </Text>
                {language === lang.code && <Check size={20} color="#3b82f6" />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text
                style={[
                  styles.modalCancelText,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderThemeModal = () => {
    const themes: {
      mode: ThemeMode;
      nameKey: string;
      icon: React.ReactNode;
    }[] = [
      {
        mode: "light",
        nameKey: "settings.theme.light",
        icon: <Sun size={20} color="#f59e0b" />,
      },
      {
        mode: "dark",
        nameKey: "settings.theme.dark",
        icon: <Moon size={20} color="#6366f1" />,
      },
      {
        mode: "system",
        nameKey: "settings.theme.system",
        icon: <Monitor size={20} color="#6b7280" />,
      },
    ];

    return (
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View
          style={[styles.modalOverlay, isDarkMode && styles.darkModalOverlay]}
        >
          <View
            style={[styles.modalContent, isDarkMode && styles.darkModalContent]}
          >
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              {t("settings.theme")}
            </Text>

            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.mode}
                style={[
                  styles.modalOption,
                  isDarkMode && styles.darkModalOption,
                ]}
                onPress={() => handleThemeSelect(theme.mode)}
              >
                <View style={styles.modalOptionLeft}>
                  {theme.icon}
                  <Text
                    style={[
                      styles.modalOptionText,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    {t(theme.nameKey)}
                  </Text>
                </View>
                {themeMode === theme.mode && (
                  <Check size={20} color="#3b82f6" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowThemeModal(false)}
            >
              <Text
                style={[
                  styles.modalCancelText,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {Platform.OS !== "web" && (
        <Header
          disabledLeft
          title="Settings"
          // leftIcon={<ArrowLeft size={24} color="#111827" />}
          onLeftPress={() => router.back()}
        />
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        {isAuthenticated && user && (
          <View
            style={[styles.profileSection, isDarkMode && styles.darkBorder]}
          >
            <TouchableOpacity
              style={[styles.profileCard, isDarkMode && styles.darkProfileCard]}
              // onPress={() => router.push("/profile")}
            >
              <Avatar
                uri={user.avatar}
                size="large"
                fallbackText={user.displayName || user.handle}
              />
              <View style={styles.profileInfo}>
                <Text
                  style={[styles.profileName, isDarkMode && styles.darkText]}
                >
                  {user.displayName || user.handle}
                </Text>
                <Text
                  style={[
                    styles.profileHandle,
                    isDarkMode && styles.darkSecondaryText,
                  ]}
                >
                  @{user.handle}
                </Text>
              </View>
              <ChevronRight size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Settings Sections */}
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              {t(section.titleKey)}
            </Text>
            <View
              style={[
                styles.sectionContent,
                isDarkMode && styles.darkSectionContent,
              ]}
            >
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.lastItem,
                    isDarkMode && styles.darkBorder,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.settingLeft}>
                    {item.icon}
                    <Text
                      style={[
                        styles.settingTitle,
                        item.destructive && styles.destructiveText,
                        isDarkMode && !item.destructive && styles.darkText,
                      ]}
                    >
                      {t(item.titleKey)}
                    </Text>
                  </View>
                  <View style={styles.settingRight}>
                    {item.value && (
                      <Text
                        style={[
                          styles.settingValue,
                          isDarkMode && styles.darkSecondaryText,
                        ]}
                      >
                        {item.value}
                      </Text>
                    )}
                    {item.showChevron && (
                      <ChevronRight size={16} color="#6b7280" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign In Prompt for Unauthenticated Users */}
        {!isAuthenticated && (
          <View
            style={[
              styles.signInSection,
              isDarkMode && styles.darkSignInSection,
            ]}
          >
            <Text style={[styles.signInTitle, isDarkMode && styles.darkText]}>
              Get the most out of Sky Social
            </Text>
            <Text
              style={[
                styles.signInDescription,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              Sign in to access your profile, create posts, and connect with
              others.
            </Text>
            <Button
              title={t("auth.signin")}
              onPress={() => router.push("/profile")}
              variant="primary"
              size="large"
              style={styles.signInButton}
            />
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {renderLanguageModal()}
      {renderThemeModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  darkContainer: {
    backgroundColor: "#111827",
  },
  content: {
    flex: 1,
  },
  profileSection: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  darkBorder: {
    borderBottomColor: "#374151",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    gap: 12,
  },
  darkProfileCard: {
    backgroundColor: "#1f2937",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  profileHandle: {
    fontSize: 14,
    color: "#6b7280",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  darkSectionContent: {
    backgroundColor: "#1f2937",
    borderColor: "#374151",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  destructiveText: {
    color: "#ef4444",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: "#6b7280",
  },
  signInSection: {
    margin: 16,
    padding: 24,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    alignItems: "center",
  },
  darkSignInSection: {
    backgroundColor: "#1f2937",
  },
  signInTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  signInDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  signInButton: {
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  darkModalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 280,
    maxWidth: 400,
  },
  darkModalContent: {
    backgroundColor: "#1f2937",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  darkModalOption: {
    backgroundColor: "rgba(55, 65, 81, 0.3)",
  },
  modalOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#111827",
  },
  modalCancelButton: {
    marginTop: 8,
    padding: 16,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  darkText: {
    color: "#f9fafb",
  },
  darkSecondaryText: {
    color: "#9ca3af",
  },
});
