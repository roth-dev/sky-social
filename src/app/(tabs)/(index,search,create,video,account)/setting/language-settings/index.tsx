import React, { useState, useCallback, useEffect } from "react";
import { ScrollView, ActivityIndicator } from "react-native";
import { Header } from "@/components/Header";
import { useSettings, Language } from "@/contexts/SettingsContext";
import { useI18n } from "@/contexts/I18nProvider";
import { Text, View, Dialog, SettingsSection } from "@/components/ui";
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
        setLanguage(selectedLanguage);
        changeLocale(selectedLanguage);

        // Save to AsyncStorage
        await AsyncStorage.setItem("selectedLanguage", selectedLanguage);
      } catch {
        Dialog.show(t`Error`, t`Failed to change language. Please try again.`);
      } finally {
        setLoading(false);
      }
    },
    [language, setLanguage, changeLocale]
  );

  const handleDownloadLanguage = useCallback(
    async (langCode: Language) => {
      if (downloadingLanguages.has(langCode)) return;

      setDownloadingLanguages((prev) => new Set(prev).add(langCode));

      try {
        setLanguages((prev) =>
          prev.map((lang) =>
            lang.code === langCode
              ? { ...lang, isDownloaded: true, downloadSize: undefined }
              : lang
          )
        );

        Dialog.show(
          "Download Complete",
          `${
            languages.find((l) => l.code === langCode)?.name
          } language pack has been downloaded.`
        );
      } catch (error) {
        console.error(`Failed to download ${langCode}:`, error);
        Dialog.show(
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

  const handleResetLanguageData = useCallback(async () => {
    Dialog.show(
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

              Dialog.show(
                "Success",
                "Language data has been reset to defaults."
              );
            } catch (error) {
              console.error("Failed to reset language data:", error);
              Dialog.show("Error", "Failed to reset language data.");
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
        className={`${
          isSelected
            ? isDarkMode
              ? "bg-blue-900/20"
              : "bg-blue-50"
            : isDarkMode
            ? "bg-gray-800"
            : "bg-white"
        }`}
      >
        <Button
          variant="ghost"
          className="p-0 bg-transparent w-full"
          onPress={() => handleLanguageSelect(lang.code)}
          disabled={loading || isDownloading}
        >
          <View className="flex-row items-center p-4 w-full">
            <View className="mr-3">
              <Globe size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
            </View>
            <View className="flex-1">
              <Text
                className={`text-base font-medium ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              >
                <Trans>{lang.name}</Trans>
              </Text>
              <Text
                className={`text-sm mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {lang.nativeName}
              </Text>
              <Text
                className={`text-xs mt-0.5 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {lang.region}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {isSelected && (
                <View className="ml-2">
                  <Check size={20} color="#007AFF" />
                </View>
              )}

              {!lang.isDownloaded && !isDownloading && (
                <Button
                  variant="secondary"
                  size="small"
                  onPress={() => handleDownloadLanguage(lang.code)}
                  className="min-w-10 h-8"
                >
                  <Download
                    size={16}
                    color={isDarkMode ? "#ffffff" : "#666666"}
                  />
                </Button>
              )}

              {isDownloading && (
                <View className="p-1">
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
      <View key={section.id} className="mb-8">
        <Text
          className={`text-xs font-semibold uppercase tracking-wider mb-2 ml-4 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <Trans>{section.title}</Trans>
        </Text>
        <View
          className={`rounded-lg overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {section.items.map((item, index) => (
            <View key={item.code}>
              {renderLanguageItem(item)}
              {index < section.items.length - 1 && (
                <View
                  className={`h-px ml-12 ${
                    isDarkMode ? "bg-gray-600" : "bg-gray-300"
                  }`}
                />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <Header title={t`Language Settings`} />
      <ScrollView
        className="flex-1"
        // contentContainerStyle={{ padding: 16 }}
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Current Language Info */}
        <View className="mb-8">
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-4">
            <Trans>Current Language</Trans>
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <View className="flex-row items-center">
              <Globe size={24} color="#007AFF" />
              <View className="ml-3 flex-1">
                <Text className="text-lg font-semibold text-black dark:text-white mb-1">
                  {languages.find((l) => l.code === language)?.name ||
                    "Unknown"}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
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
        <SettingsSection
          title="Settings"
          items={[
            {
              title: "Auto-download languages",
              description:
                "Automatically download language packs when selected",
              type: "toggle",
              icon: (
                <Download
                  size={20}
                  className="text-gray-600 dark:text-gray-300"
                />
              ),
              value: autoDownloadEnabled,
              onToggle: setAutoDownloadEnabled,
            },
            {
              title: "Reset language data",
              description: "Reset all language preferences to defaults",
              type: "button",
              icon: <RefreshCw size={20} className="text-red-500" />,
              destructive: true,
              onPress: handleResetLanguageData,
            },
          ]}
        />

        {/* Info Section */}
        <View className="mb-8">
          <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex-row items-start">
            <Info size={20} color="#007AFF" className="mt-0.5 mr-3" />
            <Text className="text-sm text-gray-600 dark:text-gray-300 flex-1 leading-5">
              <Trans>
                Language changes take effect immediately. Some content may
                require app restart to display in the new language.
              </Trans>
            </Text>
          </View>
        </View>

        {loading && (
          <View className="p-8 items-center">
            <ActivityIndicator size="large" color="#007AFF" />
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              <Trans>Changing language...</Trans>
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
