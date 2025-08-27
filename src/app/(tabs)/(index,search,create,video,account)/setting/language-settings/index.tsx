import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Header } from "@/components/Header";
import { useSettings, Language } from "@/contexts/SettingsContext";
import { useI18n } from "@/contexts/I18nProvider";
import { Text, View } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { Check, Globe, Download, RefreshCw, Info } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  region: string;
  isDownloaded: boolean;
  downloadSize?: string;
  isDownloading?: boolean;
}

interface LanguageSection {
  id: string;
  title: string;
  items: LanguageOption[];
}

export default function LanguageSettingsScreen() {
  const { isDarkMode, language, setLanguage } = useSettings();
  const { changeLocale } = useI18n();

  const [languages, setLanguages] = useState<LanguageOption[]>([
    {
      code: "en",
      name: "English",
      nativeName: "English",
      region: "United States",
      isDownloaded: true,
    },
    {
      code: "km",
      name: "Khmer",
      nativeName: "ខ្មែរ",
      region: "Cambodia",
      isDownloaded: true,
    },
  ]);

  const [downloadingLanguages, setDownloadingLanguages] = useState<
    Set<Language>
  >(new Set());
  const [autoDownloadEnabled, setAutoDownloadEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadLanguageSettings = useCallback(async () => {
    try {
      const autoDownload = await AsyncStorage.getItem("autoDownloadLanguages");
      if (autoDownload !== null) {
        setAutoDownloadEnabled(autoDownload === "true");
      }
    } catch (error) {
      console.error("Failed to load language settings:", error);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadLanguageSettings();
  }, [loadLanguageSettings]);

  const handleLanguageSelect = useCallback(
    async (selectedLanguage: Language) => {
      if (selectedLanguage === language) return;

      try {
        setLoading(true);

        // Simulate language switching delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setLanguage(selectedLanguage);
        changeLocale(selectedLanguage);

        // Save to AsyncStorage
        await AsyncStorage.setItem("selectedLanguage", selectedLanguage);

        Alert.alert(
          "Language Changed",
          `Language has been changed to ${
            languages.find((l) => l.code === selectedLanguage)?.name ||
            selectedLanguage
          }.`,
          [{ text: "OK" }]
        );
      } catch (error) {
        console.error("Failed to change language:", error);
        Alert.alert("Error", "Failed to change language. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [language, setLanguage, changeLocale, languages]
  );

  const handleDownloadLanguage = useCallback(
    async (langCode: Language) => {
      if (downloadingLanguages.has(langCode)) return;

      setDownloadingLanguages((prev) => new Set(prev).add(langCode));

      try {
        // Simulate download process
        await new Promise((resolve) => setTimeout(resolve, 3000));

        setLanguages((prev) =>
          prev.map((lang) =>
            lang.code === langCode
              ? { ...lang, isDownloaded: true, downloadSize: undefined }
              : lang
          )
        );

        Alert.alert(
          "Download Complete",
          `${
            languages.find((l) => l.code === langCode)?.name
          } language pack has been downloaded.`
        );
      } catch (error) {
        console.error(`Failed to download ${langCode}:`, error);
        Alert.alert(
          "Download Failed",
          "Failed to download language pack. Please try again."
        );
      } finally {
        setDownloadingLanguages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(langCode);
          return newSet;
        });
      }
    },
    [downloadingLanguages, languages]
  );

  const handleToggleAutoDownload = useCallback(async () => {
    const newValue = !autoDownloadEnabled;
    setAutoDownloadEnabled(newValue);

    try {
      await AsyncStorage.setItem("autoDownloadLanguages", newValue.toString());
    } catch (error) {
      console.error("Failed to save auto download setting:", error);
    }
  }, [autoDownloadEnabled]);

  const handleResetLanguageData = useCallback(async () => {
    Alert.alert(
      "Reset Language Data",
      "This will reset all language preferences and clear downloaded language packs. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              // Reset to default language
              setLanguage("en");
              changeLocale("en");

              // Reset language data
              setLanguages((prev) =>
                prev.map((lang) => ({
                  ...lang,
                  isDownloaded: lang.code === "en",
                }))
              );

              // Clear AsyncStorage
              await AsyncStorage.multiRemove([
                "selectedLanguage",
                "autoDownloadLanguages",
              ]);
              setAutoDownloadEnabled(true);

              Alert.alert(
                "Success",
                "Language data has been reset to defaults."
              );
            } catch (error) {
              console.error("Failed to reset language data:", error);
              Alert.alert("Error", "Failed to reset language data.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [setLanguage, changeLocale]);

  const renderLanguageItem = (lang: LanguageOption) => {
    const isSelected = language === lang.code;
    const isDownloading = downloadingLanguages.has(lang.code);

    return (
      <View
        key={lang.code}
        style={[
          styles.languageItem,
          isDarkMode && styles.darkLanguageItem,
          isSelected && styles.selectedItem,
          isSelected && isDarkMode && styles.darkSelectedItem,
        ]}
      >
        <Button
          variant="ghost"
          style={styles.languageButton}
          onPress={() => handleLanguageSelect(lang.code)}
          disabled={loading || isDownloading}
        >
          <View style={styles.languageContent}>
            <View style={styles.languageIcon}>
              <Globe size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
            </View>
            <View style={styles.languageInfo}>
              <Text
                style={[styles.languageName, isDarkMode && styles.darkText]}
              >
                <Trans>{lang.name}</Trans>
              </Text>
              <Text
                style={[
                  styles.nativeName,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                {lang.nativeName}
              </Text>
              <Text
                style={[
                  styles.regionName,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                {lang.region}
              </Text>
            </View>
            <View style={styles.languageActions}>
              {isSelected && (
                <View style={styles.checkIcon}>
                  <Check size={20} color="#007AFF" />
                </View>
              )}

              {!lang.isDownloaded && !isDownloading && (
                <Button
                  variant="secondary"
                  size="small"
                  onPress={() => handleDownloadLanguage(lang.code)}
                  style={styles.downloadButton}
                >
                  <Download
                    size={16}
                    color={isDarkMode ? "#ffffff" : "#666666"}
                  />
                </Button>
              )}

              {isDownloading && (
                <View style={styles.downloadingIndicator}>
                  <ActivityIndicator size="small" color="#007AFF" />
                </View>
              )}
            </View>
          </View>
        </Button>
      </View>
    );
  };

  const sections: LanguageSection[] = [
    {
      id: "available",
      title: "Available Languages",
      items: languages,
    },
  ];

  const renderSection = (section: LanguageSection) => {
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
            <View key={item.code}>
              {renderLanguageItem(item)}
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
      <Header title={t`Language Settings`} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Language Info */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode && styles.darkSecondaryText,
            ]}
          >
            <Trans>Current Language</Trans>
          </Text>
          <View
            style={[
              styles.currentLanguageCard,
              isDarkMode && styles.darkCurrentLanguageCard,
            ]}
          >
            <View style={styles.currentLanguageInfo}>
              <Globe size={24} color="#007AFF" />
              <View style={styles.currentLanguageText}>
                <Text
                  style={[
                    styles.currentLanguageName,
                    isDarkMode && styles.darkText,
                  ]}
                >
                  {languages.find((l) => l.code === language)?.name ||
                    "Unknown"}
                </Text>
                <Text
                  style={[
                    styles.currentLanguageNative,
                    isDarkMode && styles.darkSecondaryText,
                  ]}
                >
                  {languages.find((l) => l.code === language)?.nativeName ||
                    language}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Language List */}
        {sections.map(renderSection)}

        {/* Settings */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode && styles.darkSecondaryText,
            ]}
          >
            <Trans>Settings</Trans>
          </Text>
          <View
            style={[
              styles.sectionContent,
              isDarkMode && styles.darkSectionContent,
            ]}
          >
            <View
              style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Download
                    size={20}
                    color={isDarkMode ? "#ffffff" : "#666666"}
                  />
                </View>
                <View style={styles.settingText}>
                  <Text
                    style={[styles.settingTitle, isDarkMode && styles.darkText]}
                  >
                    <Trans>Auto-download languages</Trans>
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      isDarkMode && styles.darkSecondaryText,
                    ]}
                  >
                    <Trans>
                      Automatically download language packs when selected
                    </Trans>
                  </Text>
                </View>
              </View>
              <Button
                variant={autoDownloadEnabled ? "primary" : "secondary"}
                size="small"
                title={autoDownloadEnabled ? "Enabled" : "Disabled"}
                onPress={handleToggleAutoDownload}
              />
            </View>

            <View
              style={[styles.separator, isDarkMode && styles.darkSeparator]}
            />

            <View
              style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <RefreshCw
                    size={20}
                    color={isDarkMode ? "#ff3b30" : "#ff3b30"}
                  />
                </View>
                <View style={styles.settingText}>
                  <Text
                    style={[
                      styles.settingTitle,
                      isDarkMode && styles.darkText,
                      styles.destructiveText,
                    ]}
                  >
                    <Trans>Reset language data</Trans>
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      isDarkMode && styles.darkSecondaryText,
                    ]}
                  >
                    <Trans>Reset all language preferences to defaults</Trans>
                  </Text>
                </View>
              </View>
              <Button
                variant="destructive"
                size="small"
                title="Reset"
                onPress={handleResetLanguageData}
                disabled={loading}
              />
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
            <Info size={20} color={isDarkMode ? "#007AFF" : "#007AFF"} />
            <Text
              style={[styles.infoText, isDarkMode && styles.darkSecondaryText]}
            >
              <Trans>
                Language changes take effect immediately. Some content may
                require app restart to display in the new language.
              </Trans>
            </Text>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text
              style={[
                styles.loadingText,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              <Trans>Changing language...</Trans>
            </Text>
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
  currentLanguageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
  },
  darkCurrentLanguageCard: {
    backgroundColor: "#1c1c1e",
  },
  currentLanguageInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentLanguageText: {
    marginLeft: 12,
    flex: 1,
  },
  currentLanguageName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  currentLanguageNative: {
    fontSize: 14,
    color: "#8e8e93",
    marginTop: 2,
  },
  languageItem: {
    backgroundColor: "#ffffff",
  },
  darkLanguageItem: {
    backgroundColor: "#1c1c1e",
  },
  selectedItem: {
    backgroundColor: "#f0f8ff",
  },
  darkSelectedItem: {
    backgroundColor: "#1a2332",
  },
  languageButton: {
    padding: 0,
    backgroundColor: "transparent",
    width: "100%",
  },
  languageContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    width: "100%",
  },
  languageIcon: {
    marginRight: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  nativeName: {
    fontSize: 14,
    color: "#8e8e93",
    marginTop: 2,
  },
  regionName: {
    fontSize: 12,
    color: "#8e8e93",
    marginTop: 1,
  },
  languageActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkIcon: {
    marginLeft: 8,
  },
  downloadButton: {
    minWidth: 40,
    height: 32,
  },
  downloadingIndicator: {
    padding: 4,
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
    marginTop: 8,
  },
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#8e8e93",
  },
});
