import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, ScrollView, Switch, Appearance } from "react-native";
import { Header } from "@/components/Header";
import { useSettings, ThemeMode } from "@/contexts/SettingsContext";
import { Dialog } from "@/components/ui";
import { Text, View } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
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

interface ThemeSetting {
  id: string;
  title: string;
  description?: string;
  type: "toggle" | "button" | "info";
  icon: React.ReactNode;
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => Promise<void> | void;
}

interface ThemeSection {
  id: string;
  title: string;
  items: ThemeSetting[];
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
      Dialog.show("Error", `Failed to save ${key} setting`);
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
        style={[
          styles.themeOption,
          isDarkMode && styles.darkThemeOption,
          isSelected && styles.selectedTheme,
          isSelected && isDarkMode && styles.darkSelectedTheme,
        ]}
      >
        <Button
          variant="ghost"
          style={styles.themeButton}
          onPress={() => handleThemeSelect(theme.mode)}
          disabled={loading}
        >
          <View style={styles.themeContent}>
            <View
              style={[
                styles.themeIconContainer,
                { backgroundColor: `${theme.color}20` },
              ]}
            >
              {theme.icon}
            </View>
            <View style={styles.themeInfo}>
              <Text style={[styles.themeName, isDarkMode && styles.darkText]}>
                <Trans>{theme.name}</Trans>
              </Text>
              <Text
                style={[
                  styles.themeDescription,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                <Trans>{theme.description}</Trans>
              </Text>
              {theme.mode === "system" && (
                <Text
                  style={[
                    styles.systemThemeInfo,
                    isDarkMode && styles.darkSecondaryText,
                  ]}
                >
                  <Trans>
                    Currently: {systemTheme === "dark" ? "Dark" : "Light"}
                  </Trans>
                </Text>
              )}
            </View>
            {isSelected && (
              <View style={styles.checkIcon}>
                <Check size={20} color="#007AFF" />
              </View>
            )}
          </View>
        </Button>
      </View>
    );
  };

  const sections: ThemeSection[] = [
    {
      id: "automation",
      title: "Automation",
      items: [
        {
          id: "auto-theme",
          title: "Auto theme switching",
          description:
            "Automatically switch between light and dark based on time",
          type: "toggle",
          icon: <Clock size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: autoThemeEnabled,
          onToggle: handleAutoThemeToggle,
        },
        {
          id: "schedule",
          title: "Custom schedule",
          description: "Set specific times for theme changes",
          type: "toggle",
          icon: (
            <Settings size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
          value: scheduleEnabled,
          onToggle: handleScheduleToggle,
        },
      ],
    },
    {
      id: "accessibility",
      title: "Accessibility",
      items: [
        {
          id: "high-contrast",
          title: "High contrast",
          description: "Increase contrast for better readability",
          type: "toggle",
          icon: <Eye size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: highContrastEnabled,
          onToggle: handleHighContrastToggle,
        },
        {
          id: "adaptive-colors",
          title: "Adaptive colors",
          description: "Adjust colors based on content and environment",
          type: "toggle",
          icon: (
            <Palette size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
          value: adaptiveColorsEnabled,
          onToggle: handleAdaptiveColorsToggle,
        },
      ],
    },
    {
      id: "customization",
      title: "Customization",
      items: [
        {
          id: "customize-colors",
          title: "Customize colors",
          description: "Create your own color theme",
          type: "button",
          icon: (
            <Palette size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
          onPress: handleCustomizeColors,
        },
        {
          id: "reset-settings",
          title: "Reset theme settings",
          description: "Reset all theme preferences to defaults",
          type: "button",
          icon: (
            <RefreshCw size={20} color={isDarkMode ? "#ff3b30" : "#ff3b30"} />
          ),
          onPress: handleResetThemeSettings,
        },
      ],
    },
  ];

  const renderSettingItem = (item: ThemeSetting) => {
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
                item.id === "reset-settings" && styles.destructiveText,
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
                <Trans>{item.description}</Trans>
              </Text>
            )}
          </View>
        </View>

        {item.type === "toggle" && (
          <Switch
            value={item.value as boolean}
            onValueChange={item.onToggle}
            disabled={loading}
            thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
            trackColor={{
              false: isDarkMode ? "#39393d" : "#767577",
              true: "#007AFF",
            }}
          />
        )}

        {item.type === "button" && (
          <Button
            variant={item.id === "reset-settings" ? "destructive" : "secondary"}
            size="small"
            title={item.id === "reset-settings" ? "Reset" : "Customize"}
            onPress={item.onPress}
            disabled={loading}
          />
        )}
      </View>
    );
  };

  const renderSection = (section: ThemeSection) => {
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
      <Header title={t`Theme Settings`} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Theme Display */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode && styles.darkSecondaryText,
            ]}
          >
            <Trans>Current Theme</Trans>
          </Text>
          <View
            style={[
              styles.currentThemeCard,
              isDarkMode && styles.darkCurrentThemeCard,
            ]}
          >
            <View style={styles.currentThemeInfo}>
              {themes.find((t) => t.mode === themeMode)?.icon}
              <View style={styles.currentThemeText}>
                <Text
                  style={[
                    styles.currentThemeName,
                    isDarkMode && styles.darkText,
                  ]}
                >
                  {themes.find((t) => t.mode === themeMode)?.name || "Unknown"}
                </Text>
                <Text
                  style={[
                    styles.currentThemeDescription,
                    isDarkMode && styles.darkSecondaryText,
                  ]}
                >
                  {themes.find((t) => t.mode === themeMode)?.description ||
                    themeMode}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Theme Options */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode && styles.darkSecondaryText,
            ]}
          >
            <Trans>Theme Options</Trans>
          </Text>
          <View
            style={[
              styles.sectionContent,
              isDarkMode && styles.darkSectionContent,
            ]}
          >
            {themes.map((theme, index) => (
              <View key={theme.mode}>
                {renderThemeOption(theme)}
                {index < themes.length - 1 && (
                  <View
                    style={[
                      styles.separator,
                      isDarkMode && styles.darkSeparator,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Settings Sections */}
        {sections.map(renderSection)}

        {/* Info Section */}
        <View style={styles.section}>
          <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
            <Info size={20} color={isDarkMode ? "#007AFF" : "#007AFF"} />
            <Text
              style={[styles.infoText, isDarkMode && styles.darkSecondaryText]}
            >
              <Trans>
                Theme changes take effect immediately. System theme follows your
                device&apos;s appearance settings.
              </Trans>
            </Text>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <Text
              style={[
                styles.loadingText,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              <Trans>Applying theme...</Trans>
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
  currentThemeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
  },
  darkCurrentThemeCard: {
    backgroundColor: "#1c1c1e",
  },
  currentThemeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentThemeText: {
    marginLeft: 12,
    flex: 1,
  },
  currentThemeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  currentThemeDescription: {
    fontSize: 14,
    color: "#8e8e93",
    marginTop: 2,
  },
  themeOption: {
    backgroundColor: "#ffffff",
  },
  darkThemeOption: {
    backgroundColor: "#1c1c1e",
  },
  selectedTheme: {
    backgroundColor: "#f0f8ff",
  },
  darkSelectedTheme: {
    backgroundColor: "#1a2332",
  },
  themeButton: {
    padding: 0,
    backgroundColor: "transparent",
    width: "100%",
  },
  themeContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    width: "100%",
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  themeDescription: {
    fontSize: 14,
    color: "#8e8e93",
    marginTop: 2,
  },
  systemThemeInfo: {
    fontSize: 12,
    color: "#8e8e93",
    marginTop: 1,
    fontStyle: "italic",
  },
  checkIcon: {
    marginLeft: 8,
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
  },
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#8e8e93",
  },
});
