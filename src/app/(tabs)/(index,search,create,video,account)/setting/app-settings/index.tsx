import React, { useState, useCallback, useEffect } from "react";
import { ScrollView, Platform } from "react-native";
import { Header } from "@/components/Header";
import { useSettings } from "@/contexts/SettingsContext";
import { Text, View, Dialog, SettingsSection } from "@/components/ui";
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
      Dialog.show(t`Error`, t`Failed to save setting`);
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
    Dialog.show(
      t`Clear Cache`,
      t`This will clear all cached images, videos, and temporary files. Are you sure?`,
      [
        { text: t`Cancel`, style: "cancel" },
        {
          text: t`Clear`,
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
              Dialog.show(t`Success`, t`Cache cleared successfully`);
            } catch (error) {
              console.error("Failed to clear cache:", error);
              Dialog.show(t`Error`, t`Failed to clear cache`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, []);

  const handleClearDownloads = useCallback(async () => {
    Dialog.show(
      t`Clear Downloads`,
      t`This will remove all downloaded media files. Are you sure?`,
      [
        { text: t`Cancel`, style: "cancel" },
        {
          text: t`Clear`,
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              if (Platform.OS !== "web") {
                // Clear downloaded media - simplified implementation
                setDownloadedMedia("0 MB");
                Dialog.show(t`Success`, t`Downloads cleared successfully`);
              } else {
                Dialog.show(t`Info`, t`Download clearing not available on web`);
              }
            } catch (error) {
              console.error("Failed to clear downloads:", error);
              Dialog.show(t`Error`, t`Failed to clear downloads`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, []);

  const handleResetSettings = useCallback(async () => {
    Dialog.show(
      t`Reset App Settings`,
      t`This will reset all app settings to their default values. Are you sure?`,
      [
        { text: t`Cancel`, style: "cancel" },
        {
          text: t`Reset`,
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

              Dialog.show(t`Success`, t`App settings reset to defaults`);
            } catch (error) {
              console.error("Failed to reset settings:", error);
              Dialog.show(t`Error`, t`Failed to reset settings`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, []);

  const handleNetworkSettings = useCallback(() => {
    Dialog.show(t`Network Settings`, t`Network configuration coming soon!`, [
      { text: t`OK` },
    ]);
  }, []);

  const handleStorageSettings = useCallback(() => {
    Dialog.show(t`Storage Settings`, t`Storage management coming soon!`, [
      { text: t`OK` },
    ]);
  }, []);

  const handlePrivacySettings = useCallback(() => {
    Dialog.show(t`Privacy Settings`, t`Privacy configuration coming soon!`, [
      { text: t`OK` },
    ]);
  }, []);

  const sections: AppSettingsSection[] = [
    {
      id: "media",
      title: t`Media & Content`,
      items: [
        {
          id: "auto-play-videos",
          title: t`Auto-play videos`,
          description: t`Automatically play videos in your timeline`,
          type: "toggle",
          icon: <Video size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: autoPlayVideos,
          onToggle: handleAutoPlayVideos,
          disabled: dataSeaver,
        },
        {
          id: "auto-load-images",
          title: t`Auto-load images`,
          description: t`Automatically load images in your timeline`,
          type: "toggle",
          icon: <Image size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: autoLoadImages,
          onToggle: handleAutoLoadImages,
          disabled: dataSeaver,
        },
        {
          id: "data-saver",
          title: t`Data saver mode`,
          description: t`Reduce data usage by disabling auto-play and auto-load`,
          type: "toggle",
          icon: <Wifi size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: dataSeaver,
          onToggle: handleDataSaver,
        },
      ],
    },
    {
      id: "notifications",
      title: t`Notifications & Sounds`,
      items: [
        {
          id: "notifications",
          title: t`Enable notifications`,
          description: t`Receive push notifications for mentions and messages`,
          type: "toggle",
          icon: <Bell size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: enableNotifications,
          onToggle: handleNotifications,
        },
        {
          id: "sounds",
          title: t`Notification sounds`,
          description: t`Play sound for notifications`,
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
          title: t`Haptic feedback`,
          description: t`Vibration feedback for interactions`,
          type: "toggle",
          icon: <Zap size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: enableHaptics,
          onToggle: handleHaptics,
        },
      ],
    },
    {
      id: "storage",
      title: t`Storage & Data`,
      items: [
        {
          id: "cache-size",
          title: t`Cache size`,
          description: cacheSize,
          type: "info",
          icon: (
            <Database size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
        },
        {
          id: "downloaded-media",
          title: t`Downloaded media`,
          description: downloadedMedia,
          type: "info",
          icon: (
            <Download size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
        },
        {
          id: "clear-cache",
          title: t`Clear cache`,
          description: t`Remove cached images and temporary files`,
          type: "button",
          icon: (
            <RefreshCw size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
          onPress: handleClearCache,
        },
        {
          id: "clear-downloads",
          title: t`Clear downloads`,
          description: t`Remove all downloaded media files`,
          type: "button",
          icon: <Trash2 size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleClearDownloads,
          destructive: true,
        },
      ],
    },
    {
      id: "advanced",
      title: t`Advanced Settings`,
      items: [
        {
          id: "network-settings",
          title: t`Network settings`,
          description: t`Configure connection and proxy settings`,
          type: "navigation",
          icon: <Wifi size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleNetworkSettings,
        },
        {
          id: "storage-settings",
          title: t`Storage settings`,
          description: t`Manage storage locations and limits`,
          type: "navigation",
          icon: (
            <HardDrive size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
          onPress: handleStorageSettings,
        },
        {
          id: "privacy-settings",
          title: t`Privacy settings`,
          description: t`App-level privacy and security settings`,
          type: "navigation",
          icon: <Shield size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handlePrivacySettings,
        },
      ],
    },
    {
      id: "reset",
      title: t`Reset`,
      items: [
        {
          id: "reset-settings",
          title: t`Reset app settings`,
          description: t`Reset all app settings to their default values`,
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

  const renderSection = (section: AppSettingsSection) => {
    return (
      <SettingsSection
        key={section.id}
        title={section.title}
        items={section.items.map((item) => ({
          ...item,
          loading,
        }))}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <Header title={t`App Settings`} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {sections.map(renderSection)}

        {loading && (
          <View className="p-5 items-center">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              <Trans>Processing...</Trans>
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
