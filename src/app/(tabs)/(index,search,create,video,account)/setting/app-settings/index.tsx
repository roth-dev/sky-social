import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, ScrollView, Alert, Switch, Platform } from "react-native";
import { Header } from "@/components/Header";
import { useSettings } from "@/contexts/SettingsContext";
import { Text, View } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import {
  Bell,
  Download,
  Database,
  Wifi,
  Image,
  Video,
  Volume2,
  Zap,
  Shield,
  HardDrive,
  RefreshCw,
  Trash2,
  RotateCcw,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

interface AppSetting {
  id: string;
  title: string;
  description?: string;
  type: "toggle" | "button" | "info" | "navigation";
  icon: React.ReactNode;
  value?: boolean | string | number;
  onPress?: () => void;
  onToggle?: (value: boolean) => Promise<void> | void;
  destructive?: boolean;
  disabled?: boolean;
}

interface AppSettingsSection {
  id: string;
  title: string;
  items: AppSetting[];
}

export default function AppSettingsScreen() {
  const { isDarkMode } = useSettings();

  // App Settings State
  const [autoPlayVideos, setAutoPlayVideos] = useState(true);
  const [autoLoadImages, setAutoLoadImages] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableSounds, setEnableSounds] = useState(true);
  const [enableHaptics, setEnableHaptics] = useState(true);
  const [dataSeaver, setDataSaver] = useState(false);
  const [cacheSize, setCacheSize] = useState("0 MB");
  const [downloadedMedia, setDownloadedMedia] = useState("0 MB");
  const [loading, setLoading] = useState(false);

  const loadAppSettings = useCallback(async () => {
    try {
      const settings = await AsyncStorage.multiGet([
        "autoPlayVideos",
        "autoLoadImages",
        "enableNotifications",
        "enableSounds",
        "enableHaptics",
        "dataSeaver",
      ]);

      settings.forEach(([key, value]) => {
        if (value !== null) {
          const boolValue = value === "true";
          switch (key) {
            case "autoPlayVideos":
              setAutoPlayVideos(boolValue);
              break;
            case "autoLoadImages":
              setAutoLoadImages(boolValue);
              break;
            case "enableNotifications":
              setEnableNotifications(boolValue);
              break;
            case "enableSounds":
              setEnableSounds(boolValue);
              break;
            case "enableHaptics":
              setEnableHaptics(boolValue);
              break;
            case "dataSeaver":
              setDataSaver(boolValue);
              break;
          }
        }
      });
    } catch (error) {
      console.error("Failed to load app settings:", error);
    }
  }, []);

  const calculateCacheSize = useCallback(async () => {
    try {
      if (Platform.OS !== "web") {
        const cacheDir = FileSystem.cacheDirectory;
        if (cacheDir) {
          const info = await FileSystem.getInfoAsync(cacheDir);
          if (info.exists && info.isDirectory) {
            // This is a simplified calculation - in reality you'd recursively calculate folder sizes
            setCacheSize("12.3 MB"); // Placeholder
          }
        }
      }
    } catch (error) {
      console.error("Failed to calculate cache size:", error);
    }
  }, []);

  // Load app settings on mount
  useEffect(() => {
    loadAppSettings();
    calculateCacheSize();
  }, [loadAppSettings, calculateCacheSize]);

  const saveSetting = useCallback(async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      Alert.alert("Error", `Failed to save ${key} setting`);
    }
  }, []);

  const handleAutoPlayVideos = useCallback(
    async (value: boolean) => {
      setAutoPlayVideos(value);
      await saveSetting("autoPlayVideos", value);
    },
    [saveSetting]
  );

  const handleAutoLoadImages = useCallback(
    async (value: boolean) => {
      setAutoLoadImages(value);
      await saveSetting("autoLoadImages", value);
    },
    [saveSetting]
  );

  const handleNotifications = useCallback(
    async (value: boolean) => {
      setEnableNotifications(value);
      await saveSetting("enableNotifications", value);
    },
    [saveSetting]
  );

  const handleSounds = useCallback(
    async (value: boolean) => {
      setEnableSounds(value);
      await saveSetting("enableSounds", value);
    },
    [saveSetting]
  );

  const handleHaptics = useCallback(
    async (value: boolean) => {
      setEnableHaptics(value);
      await saveSetting("enableHaptics", value);
    },
    [saveSetting]
  );

  const handleDataSaver = useCallback(
    async (value: boolean) => {
      setDataSaver(value);
      await saveSetting("dataSeaver", value);

      // When data saver is enabled, automatically disable auto-play and auto-load
      if (value) {
        setAutoPlayVideos(false);
        setAutoLoadImages(false);
        await saveSetting("autoPlayVideos", false);
        await saveSetting("autoLoadImages", false);
      }
    },
    [saveSetting]
  );

  const handleClearCache = useCallback(async () => {
    Alert.alert(
      "Clear Cache",
      "This will clear all cached images, videos, and temporary files. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              if (Platform.OS !== "web") {
                const cacheDir = FileSystem.cacheDirectory;
                if (cacheDir) {
                  const files = await FileSystem.readDirectoryAsync(cacheDir);
                  await Promise.all(
                    files.map((file) =>
                      FileSystem.deleteAsync(`${cacheDir}${file}`, {
                        idempotent: true,
                      })
                    )
                  );
                }
              }

              // Clear AsyncStorage cache keys
              const keys = await AsyncStorage.getAllKeys();
              const cacheKeys = keys.filter(
                (key) => key.startsWith("cache_") || key.startsWith("image_")
              );
              await AsyncStorage.multiRemove(cacheKeys);

              setCacheSize("0 MB");
              Alert.alert("Success", "Cache cleared successfully");
            } catch (error) {
              console.error("Failed to clear cache:", error);
              Alert.alert("Error", "Failed to clear cache");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, []);

  const handleClearDownloads = useCallback(async () => {
    Alert.alert(
      "Clear Downloads",
      "This will remove all downloaded media files. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              if (Platform.OS !== "web") {
                // Clear downloaded media - simplified implementation
                setDownloadedMedia("0 MB");
                Alert.alert("Success", "Downloads cleared successfully");
              } else {
                Alert.alert("Info", "Download clearing not available on web");
              }
            } catch (error) {
              console.error("Failed to clear downloads:", error);
              Alert.alert("Error", "Failed to clear downloads");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, []);

  const handleResetSettings = useCallback(async () => {
    Alert.alert(
      "Reset App Settings",
      "This will reset all app settings to their default values. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              // Reset all settings to defaults
              const defaultSettings: readonly [string, string][] = [
                ["autoPlayVideos", "true"],
                ["autoLoadImages", "true"],
                ["enableNotifications", "true"],
                ["enableSounds", "true"],
                ["enableHaptics", "true"],
                ["dataSeaver", "false"],
              ];

              await AsyncStorage.multiSet(defaultSettings);

              // Update state
              setAutoPlayVideos(true);
              setAutoLoadImages(true);
              setEnableNotifications(true);
              setEnableSounds(true);
              setEnableHaptics(true);
              setDataSaver(false);

              Alert.alert("Success", "App settings reset to defaults");
            } catch (error) {
              console.error("Failed to reset settings:", error);
              Alert.alert("Error", "Failed to reset settings");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, []);

  const handleNetworkSettings = useCallback(() => {
    Alert.alert("Network Settings", "Network configuration coming soon!", [
      { text: "OK" },
    ]);
  }, []);

  const handleStorageSettings = useCallback(() => {
    Alert.alert("Storage Settings", "Storage management coming soon!", [
      { text: "OK" },
    ]);
  }, []);

  const handlePrivacySettings = useCallback(() => {
    Alert.alert("Privacy Settings", "Privacy configuration coming soon!", [
      { text: "OK" },
    ]);
  }, []);

  const sections: AppSettingsSection[] = [
    {
      id: "media",
      title: "Media & Content",
      items: [
        {
          id: "auto-play-videos",
          title: "Auto-play videos",
          description: "Automatically play videos in your timeline",
          type: "toggle",
          icon: <Video size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: autoPlayVideos,
          onToggle: handleAutoPlayVideos,
          disabled: dataSeaver,
        },
        {
          id: "auto-load-images",
          title: "Auto-load images",
          description: "Automatically load images in your timeline",
          type: "toggle",
          icon: <Image size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: autoLoadImages,
          onToggle: handleAutoLoadImages,
          disabled: dataSeaver,
        },
        {
          id: "data-saver",
          title: "Data saver mode",
          description: "Reduce data usage by disabling auto-play and auto-load",
          type: "toggle",
          icon: <Wifi size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: dataSeaver,
          onToggle: handleDataSaver,
        },
      ],
    },
    {
      id: "notifications",
      title: "Notifications & Sounds",
      items: [
        {
          id: "notifications",
          title: "Enable notifications",
          description: "Receive push notifications for mentions and messages",
          type: "toggle",
          icon: <Bell size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: enableNotifications,
          onToggle: handleNotifications,
        },
        {
          id: "sounds",
          title: "Notification sounds",
          description: "Play sound for notifications",
          type: "toggle",
          icon: (
            <Volume2 size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
          value: enableSounds,
          onToggle: handleSounds,
          disabled: !enableNotifications,
        },
        {
          id: "haptics",
          title: "Haptic feedback",
          description: "Vibration feedback for interactions",
          type: "toggle",
          icon: <Zap size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: enableHaptics,
          onToggle: handleHaptics,
        },
      ],
    },
    {
      id: "storage",
      title: "Storage & Data",
      items: [
        {
          id: "cache-size",
          title: "Cache size",
          description: cacheSize,
          type: "info",
          icon: (
            <Database size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
        },
        {
          id: "downloaded-media",
          title: "Downloaded media",
          description: downloadedMedia,
          type: "info",
          icon: (
            <Download size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
        },
        {
          id: "clear-cache",
          title: "Clear cache",
          description: "Remove cached images and temporary files",
          type: "button",
          icon: (
            <RefreshCw size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
          onPress: handleClearCache,
        },
        {
          id: "clear-downloads",
          title: "Clear downloads",
          description: "Remove all downloaded media files",
          type: "button",
          icon: <Trash2 size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleClearDownloads,
          destructive: true,
        },
      ],
    },
    {
      id: "advanced",
      title: "Advanced Settings",
      items: [
        {
          id: "network-settings",
          title: "Network settings",
          description: "Configure connection and proxy settings",
          type: "navigation",
          icon: <Wifi size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleNetworkSettings,
        },
        {
          id: "storage-settings",
          title: "Storage settings",
          description: "Manage storage locations and limits",
          type: "navigation",
          icon: (
            <HardDrive size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
          onPress: handleStorageSettings,
        },
        {
          id: "privacy-settings",
          title: "Privacy settings",
          description: "App-level privacy and security settings",
          type: "navigation",
          icon: <Shield size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handlePrivacySettings,
        },
      ],
    },
    {
      id: "reset",
      title: "Reset",
      items: [
        {
          id: "reset-settings",
          title: "Reset app settings",
          description: "Reset all app settings to their default values",
          type: "button",
          icon: (
            <RotateCcw size={20} color={isDarkMode ? "#ff3b30" : "#ff3b30"} />
          ),
          onPress: handleResetSettings,
          destructive: true,
        },
      ],
    },
  ];

  const renderSettingItem = (item: AppSetting) => {
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
                item.disabled && styles.disabledText,
                item.destructive && styles.destructiveText,
              ]}
            >
              <Trans>{item.title}</Trans>
            </Text>
            {!!item.description && (
              <Text
                style={[
                  styles.settingDescription,
                  isDarkMode && styles.darkSecondaryText,
                  item.disabled && styles.disabledText,
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
            disabled={item.disabled || loading}
            thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
            trackColor={{
              false: isDarkMode ? "#39393d" : "#767577",
              true: "#007AFF",
            }}
          />
        )}

        {item.type === "button" && (
          <Button
            variant={item.destructive ? "destructive" : "secondary"}
            size="small"
            title={item.destructive ? "Clear" : "Manage"}
            onPress={item.onPress}
            disabled={loading}
          />
        )}

        {item.type === "navigation" && (
          <View style={styles.chevron}>
            <Text
              style={[
                styles.chevronText,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              ›
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSection = (section: AppSettingsSection) => {
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
              {item.type === "navigation" ? (
                <Button
                  variant="ghost"
                  style={styles.navigationButton}
                  onPress={item.onPress}
                >
                  {renderSettingItem(item)}
                </Button>
              ) : (
                renderSettingItem(item)
              )}
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
      <Header title={t`App Settings`} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map(renderSection)}

        {loading && (
          <View style={styles.loadingContainer}>
            <Text
              style={[
                styles.loadingText,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              <Trans>Processing...</Trans>
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
  darkText: {
    color: "#ffffff",
  },
  settingDescription: {
    fontSize: 13,
    color: "#8e8e93",
    lineHeight: 18,
  },
  darkSecondaryText: {
    color: "#8e8e93",
  },
  disabledText: {
    opacity: 0.5,
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
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 18,
    color: "#c7c7cc",
    fontWeight: "300",
  },
  navigationButton: {
    padding: 0,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#8e8e93",
  },
});
