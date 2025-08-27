import React, { useState, useCallback } from "react";
import { StyleSheet, ScrollView, Alert, Switch } from "react-native";
import { Header } from "@/components/Header";
import { useSettings } from "@/contexts/SettingsContext";
import { Text, View } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Trans } from "@lingui/react/macro";
import { Wifi, Globe, Shield, Zap } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NetworkSetting {
  id: string;
  title: string;
  description?: string;
  type: "toggle" | "button" | "info";
  icon: React.ReactNode;
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => Promise<void> | void;
}

interface NetworkSection {
  id: string;
  title: string;
  items: NetworkSetting[];
}

export default function NetworkSettingsScreen() {
  const { isDarkMode } = useSettings();

  const [useWifiOnly, setUseWifiOnly] = useState(false);
  const [enableProxy, setEnableProxy] = useState(false);
  const [reduceBandwidth, setReduceBandwidth] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleWifiOnlyToggle = useCallback(async (value: boolean) => {
    setUseWifiOnly(value);
    try {
      await AsyncStorage.setItem("useWifiOnly", value.toString());
    } catch (error) {
      console.error("Failed to save wifi setting:", error);
    }
  }, []);

  const handleProxyToggle = useCallback(async (value: boolean) => {
    setEnableProxy(value);
    try {
      await AsyncStorage.setItem("enableProxy", value.toString());
      if (value) {
        Alert.alert("Proxy Settings", "Proxy configuration coming soon!");
      }
    } catch (error) {
      console.error("Failed to save proxy setting:", error);
    }
  }, []);

  const handleBandwidthToggle = useCallback(async (value: boolean) => {
    setReduceBandwidth(value);
    try {
      await AsyncStorage.setItem("reduceBandwidth", value.toString());
    } catch (error) {
      console.error("Failed to save bandwidth setting:", error);
    }
  }, []);

  const handleTestConnection = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate connection test
      await new Promise((resolve) => setTimeout(resolve, 2000));
      Alert.alert("Connection Test", "Connection successful! Latency: 45ms");
    } catch {
      Alert.alert(
        "Connection Test",
        "Connection failed. Please check your network settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const sections: NetworkSection[] = [
    {
      id: "connectivity",
      title: "Connectivity",
      items: [
        {
          id: "wifi-only",
          title: "Use Wi-Fi only",
          description: "Only connect when on Wi-Fi to save mobile data",
          type: "toggle",
          icon: <Wifi size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: useWifiOnly,
          onToggle: handleWifiOnlyToggle,
        },
        {
          id: "reduce-bandwidth",
          title: "Reduce bandwidth usage",
          description: "Optimize for slower connections",
          type: "toggle",
          icon: <Zap size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: reduceBandwidth,
          onToggle: handleBandwidthToggle,
        },
        {
          id: "test-connection",
          title: "Test connection",
          description: "Check your current connection speed and latency",
          type: "button",
          icon: <Globe size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleTestConnection,
        },
      ],
    },
    {
      id: "proxy",
      title: "Proxy & Security",
      items: [
        {
          id: "enable-proxy",
          title: "Enable proxy",
          description: "Route traffic through a proxy server",
          type: "toggle",
          icon: <Shield size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: enableProxy,
          onToggle: handleProxyToggle,
        },
      ],
    },
  ];

  const renderSettingItem = (item: NetworkSetting) => {
    return (
      <View
        key={item.id}
        style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
      >
        <View style={styles.settingContent}>
          <View style={styles.settingIcon}>{item.icon}</View>
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>
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
            variant="secondary"
            size="small"
            title="Test"
            onPress={item.onPress}
            disabled={loading}
          />
        )}
      </View>
    );
  };

  const renderSection = (section: NetworkSection) => {
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
      <Header title="Network Settings" />
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
              <Trans>Testing connection...</Trans>
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
  separator: {
    height: 1,
    backgroundColor: "#c6c6c8",
    marginLeft: 48,
  },
  darkSeparator: {
    backgroundColor: "#38383a",
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
