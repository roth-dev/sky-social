import React, { useState, useCallback, useEffect } from "react";
import { ScrollView, Appearance } from "react-native";
import { Header } from "@/components/Header";
import { useSettings, ThemeMode } from "@/contexts/SettingsContext";
import { Dialog, SettingsSection } from "@/components/ui";
import { Text, View } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import type { SettingsItemProps } from "@/components/ui/SettingsItem";
import {
  Check,
  Sun,
  Moon,
  Monitor,
  Palette,
  Eye,
  Clock,
  Settings,
  RefreshCw,
  Info,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeOption {
  mode: ThemeMode;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function ThemeSettingsScreen() {
  const { isDarkMode, themeMode, setThemeMode } = useSettings();

  const [autoThemeEnabled, setAutoThemeEnabled] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [highContrastEnabled, setHighContrastEnabled] = useState(false);
  const [adaptiveColorsEnabled, setAdaptiveColorsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  const loadThemeSettings = useCallback(async () => {
    try {
      const settings = await AsyncStorage.multiGet([
        "autoThemeEnabled",
        "scheduleEnabled",
        "highContrastEnabled",
        "adaptiveColorsEnabled",
      ]);

      settings.forEach(([key, value]) => {
        if (value !== null) {
          const boolValue = value === "true";
          switch (key) {
            case "autoThemeEnabled":
              setAutoThemeEnabled(boolValue);
              break;
            case "scheduleEnabled":
              setScheduleEnabled(boolValue);
              break;
            case "highContrastEnabled":
              setHighContrastEnabled(boolValue);
              break;
            case "adaptiveColorsEnabled":
              setAdaptiveColorsEnabled(boolValue);
              break;
          }
        }
      });
    } catch (error) {
      console.error("Failed to load theme settings:", error);
    }
  }, []);

  const loadSystemTheme = useCallback(() => {
    const colorScheme = Appearance.getColorScheme();
    setSystemTheme(colorScheme || "light");
  }, []);

  // Load theme settings on mount
  useEffect(() => {
    loadThemeSettings();
    loadSystemTheme();
  }, [loadThemeSettings, loadSystemTheme]);

  const saveSetting = useCallback(async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      Dialog.show(t`Error`, t`Failed to save setting`);
    }
  }, []);

  const handleThemeSelect = useCallback(
    async (selectedTheme: ThemeMode) => {
      if (selectedTheme === themeMode) return;

      const themeOptions = [
        {
          mode: "light" as const,
          name: "Light",
          description: "Classic light theme with bright backgrounds",
          icon: <Sun size={24} color="#f59e0b" />,
          color: "#f59e0b",
        },
        {
          mode: "dark" as const,
          name: "Dark",
          description: "Dark theme that's easier on your eyes",
          icon: <Moon size={24} color="#6366f1" />,
          color: "#6366f1",
        },
        {
          mode: "system" as const,
          name: "System",
          description: "Follow your device's system theme",
          icon: <Monitor size={24} color="#6b7280" />,
          color: "#6b7280",
        },
      ];

      try {
        setLoading(true);

        // Simulate theme switching delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        setThemeMode(selectedTheme);

        // Save to AsyncStorage
        await AsyncStorage.setItem("selectedTheme", selectedTheme);

        Dialog.show(
          "Theme Changed",
          `Theme has been changed to ${
            themeOptions.find((t) => t.mode === selectedTheme)?.name ||
            selectedTheme
          }.`,
          [{ text: "OK" }]
        );
      } catch (error) {
        console.error("Failed to change theme:", error);
        Dialog.show("Error", "Failed to change theme. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [themeMode, setThemeMode]
  );

  const handleAutoThemeToggle = useCallback(
    async (value: boolean) => {
      setAutoThemeEnabled(value);
      await saveSetting("autoThemeEnabled", value);

      if (value) {
        Dialog.show(
          "Auto Theme",
          "Theme will automatically change based on time of day."
        );
      }
    },
    [saveSetting]
  );

  const handleScheduleToggle = useCallback(
    async (value: boolean) => {
      setScheduleEnabled(value);
      await saveSetting("scheduleEnabled", value);

      if (value) {
        Dialog.show("Schedule Theme", "Custom theme schedule coming soon!");
      }
    },
    [saveSetting]
  );

  const handleHighContrastToggle = useCallback(
    async (value: boolean) => {
      setHighContrastEnabled(value);
      await saveSetting("highContrastEnabled", value);

      Dialog.show(
        "High Contrast",
        value
          ? "High contrast mode enabled for better accessibility."
          : "High contrast mode disabled."
      );
    },
    [saveSetting]
  );

  const handleAdaptiveColorsToggle = useCallback(
    async (value: boolean) => {
      setAdaptiveColorsEnabled(value);
      await saveSetting("adaptiveColorsEnabled", value);

      if (value) {
        Dialog.show(
          "Adaptive Colors",
          "Colors will adapt based on your content and time of day."
        );
      }
    },
    [saveSetting]
  );

  const handleResetThemeSettings = useCallback(async () => {
    Dialog.show(
      "Reset Theme Settings",
      "This will reset all theme preferences to their default values. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              // Reset to default theme
              setThemeMode("system");

              // Reset all settings
              setAutoThemeEnabled(false);
              setScheduleEnabled(false);
              setHighContrastEnabled(false);
              setAdaptiveColorsEnabled(false);

              // Clear AsyncStorage
              await AsyncStorage.multiRemove([
                "selectedTheme",
                "autoThemeEnabled",
                "scheduleEnabled",
                "highContrastEnabled",
                "adaptiveColorsEnabled",
              ]);

              Dialog.show(
                "Success",
                "Theme settings have been reset to defaults."
              );
            } catch (error) {
              console.error("Failed to reset theme settings:", error);
              Dialog.show("Error", "Failed to reset theme settings.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [setThemeMode]);

  const handleCustomizeColors = useCallback(() => {
    Dialog.show("Customize Colors", "Color customization coming soon!", [
      { text: "OK" },
    ]);
  }, []);

  const themes: ThemeOption[] = [
    {
      mode: "light",
      name: "Light",
      description: "Classic light theme with bright backgrounds",
      icon: <Sun size={24} color="#f59e0b" />,
      color: "#f59e0b",
    },
    {
      mode: "dark",
      name: "Dark",
      description: "Dark theme that's easier on your eyes",
      icon: <Moon size={24} color="#6366f1" />,
      color: "#6366f1",
    },
    {
      mode: "system",
      name: "System",
      description: "Follow your device's system theme",
      icon: <Monitor size={24} color="#6b7280" />,
      color: "#6b7280",
    },
  ];

  const renderThemeOption = (theme: ThemeOption) => {
    const isSelected = themeMode === theme.mode;

    return (
      <View
        key={theme.mode}
        className={`p-4 ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
      >
        <Button
          variant="ghost"
          className="justify-between p-0 bg-transparent"
          onPress={() => handleThemeSelect(theme.mode)}
          disabled={loading}
        >
          <View className="flex-row items-center flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${theme.color}20` }}
            >
              {theme.icon}
            </View>
            <View className="flex-1">
              <Text
                className={`text-base font-medium ${
                  isSelected
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                <Trans>{theme.name}</Trans>
              </Text>
              <Text
                className={`text-sm ${
                  isSelected
                    ? "text-blue-500 dark:text-blue-300"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Trans>{theme.description}</Trans>
              </Text>
              {theme.mode === "system" && (
                <Text
                  className={`text-xs ${
                    isSelected
                      ? "text-blue-400 dark:text-blue-200"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  <Trans>
                    Currently: {systemTheme === "dark" ? "Dark" : "Light"}
                  </Trans>
                </Text>
              )}
            </View>
            {isSelected && (
              <View className="ml-2">
                <Check size={20} color="#007AFF" />
              </View>
            )}
          </View>
        </Button>
      </View>
    );
  };

  const automationSection: SettingsItemProps[] = [
    {
      title: "Auto theme switching",
      description: "Automatically switch between light and dark based on time",
      type: "toggle",
      icon: <Clock size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
      value: autoThemeEnabled,
      onToggle: handleAutoThemeToggle,
    },
    {
      title: "Custom schedule",
      description: "Set specific times for theme changes",
      type: "toggle",
      icon: <Settings size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
      value: scheduleEnabled,
      onToggle: handleScheduleToggle,
    },
  ];

  const accessibilitySection: SettingsItemProps[] = [
    {
      title: "High contrast",
      description: "Increase contrast for better readability",
      type: "toggle",
      icon: <Eye size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
      value: highContrastEnabled,
      onToggle: handleHighContrastToggle,
    },
    {
      title: "Adaptive colors",
      description: "Adjust colors based on content and environment",
      type: "toggle",
      icon: <Palette size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
      value: adaptiveColorsEnabled,
      onToggle: handleAdaptiveColorsToggle,
    },
  ];

  const customizationSection: SettingsItemProps[] = [
    {
      title: "Customize colors",
      description: "Create your own color theme",
      type: "button",
      icon: <Palette size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
      onPress: handleCustomizeColors,
    },
    {
      title: "Reset theme settings",
      description: "Reset all theme preferences to defaults",
      type: "button",
      icon: <RefreshCw size={20} color={isDarkMode ? "#ff3b30" : "#ff3b30"} />,
      onPress: handleResetThemeSettings,
      destructive: true,
    },
  ];

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <Header title={t`Theme Settings`} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Theme Display */}
        <View className="mb-8">
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-4">
            <Trans>Current Theme</Trans>
          </Text>
          <View className="bg-white dark:bg-gray-900 rounded-xl p-4">
            <View className="flex-row items-center">
              {themes.find((t) => t.mode === themeMode)?.icon}
              <View className="ml-3 flex-1">
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  {themes.find((t) => t.mode === themeMode)?.name || "Unknown"}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {themes.find((t) => t.mode === themeMode)?.description ||
                    themeMode}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Theme Options */}
        <View className="mb-8">
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-4">
            <Trans>Theme Options</Trans>
          </Text>
          <View className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
            {themes.map((theme, index) => (
              <View key={theme.mode}>
                {renderThemeOption(theme)}
                {index < themes.length - 1 && (
                  <View className="h-px bg-gray-200 dark:bg-gray-700 ml-12" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Settings Sections */}
        <SettingsSection title="Automation" items={automationSection} />
        <SettingsSection title="Accessibility" items={accessibilitySection} />
        <SettingsSection title="Customization" items={customizationSection} />

        {/* Info Section */}
        <View className="mb-8">
          <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <Info size={20} color="#007AFF" />
            <Text className="text-sm text-gray-600 dark:text-gray-300 mt-2 ml-6">
              <Trans>
                Theme changes take effect immediately. System theme follows your
                device&apos;s appearance settings.
              </Trans>
            </Text>
          </View>
        </View>

        {loading && (
          <View className="items-center py-4">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              <Trans>Applying theme...</Trans>
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
