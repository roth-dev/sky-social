import React, { useState, useCallback } from "react";
import { StyleSheet, ScrollView, Alert, Switch } from "react-native";
import { Header } from "@/components/Header";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/Button";
import { View, Text } from "@/components/ui";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import {
  Home,
  Eye,
  EyeOff,
  MessageSquare,
  Repeat,
  Quote,
  Clock,
  Zap,
  RefreshCw,
} from "lucide-react-native";

interface FeedPreferences {
  hideReplies: boolean;
  hideReposts: boolean;
  adultContentEnabled: boolean;
  showQuotePosts: boolean;
  chronologicalFeed: boolean;
  autoRefresh: boolean;
  showMutedContent: boolean;
}

interface FeedSection {
  id: string;
  title: string;
  description?: string;
  items: FeedPreferenceItem[];
}

interface FeedPreferenceItem {
  id: string;
  title: string;
  description?: string;
  type: "toggle" | "action";
  icon: React.ReactNode;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
}

export default function HomeFeedPreferencesScreen() {
  const { isDarkMode } = useSettings();

  const [preferences, setPreferences] = useState<FeedPreferences>({
    hideReplies: false,
    hideReposts: false,
    adultContentEnabled: false,
    showQuotePosts: true,
    chronologicalFeed: false,
    autoRefresh: true,
    showMutedContent: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handlePreferenceChange = useCallback(
    (key: keyof FeedPreferences, value: boolean) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: value,
      }));
      setHasChanges(true);
    },
    []
  );

  const savePreferences = useCallback(async () => {
    try {
      // Simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setHasChanges(false);
      Alert.alert(t`Success`, t`Your feed preferences have been saved.`, [
        { text: t`OK` },
      ]);
    } catch (error) {
      console.error("Failed to save feed preferences:", error);
      Alert.alert(
        t`Error`,
        t`Failed to save your feed preferences. Please try again.`,
        [{ text: t`OK` }]
      );
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    Alert.alert(
      t`Reset to Defaults`,
      t`This will reset all feed preferences to their default values. Are you sure?`,
      [
        { text: t`Cancel`, style: "cancel" },
        {
          text: t`Reset`,
          style: "destructive",
          onPress: () => {
            setPreferences({
              hideReplies: false,
              hideReposts: false,
              adultContentEnabled: false,
              showQuotePosts: true,
              chronologicalFeed: false,
              autoRefresh: true,
              showMutedContent: false,
            });
            setHasChanges(true);
          },
        },
      ]
    );
  }, []);

  const feedSections: FeedSection[] = [
    {
      id: "visibility",
      title: "Content Visibility",
      description: "Control what content appears in your home feed",
      items: [
        {
          id: "hideReplies",
          title: "Hide replies",
          description: "Hide replies from people you don't follow",
          type: "toggle",
          icon: (
            <MessageSquare
              size={20}
              color={isDarkMode ? "#ffffff" : "#666666"}
            />
          ),
          value: preferences.hideReplies,
          onToggle: (value) => handlePreferenceChange("hideReplies", value),
        },
        {
          id: "hideReposts",
          title: "Hide reposts",
          description: "Hide reposts from your timeline",
          type: "toggle",
          icon: <Repeat size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: preferences.hideReposts,
          onToggle: (value) => handlePreferenceChange("hideReposts", value),
        },
        {
          id: "showQuotePosts",
          title: "Show quote posts",
          description: "Display quote posts in your feed",
          type: "toggle",
          icon: <Quote size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: preferences.showQuotePosts,
          onToggle: (value) => handlePreferenceChange("showQuotePosts", value),
        },
        {
          id: "adultContentEnabled",
          title: "Show adult content",
          description: "Display posts marked as adult content",
          type: "toggle",
          icon: <Eye size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: preferences.adultContentEnabled,
          onToggle: (value) =>
            handlePreferenceChange("adultContentEnabled", value),
        },
        {
          id: "showMutedContent",
          title: "Show muted content",
          description: "Display content from muted users with a warning",
          type: "toggle",
          icon: <EyeOff size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: preferences.showMutedContent,
          onToggle: (value) =>
            handlePreferenceChange("showMutedContent", value),
        },
      ],
    },
    {
      id: "feed-behavior",
      title: "Feed Behavior",
      description: "Customize how your feed behaves and updates",
      items: [
        {
          id: "chronologicalFeed",
          title: "Chronological feed",
          description:
            "Show posts in chronological order instead of algorithmic",
          type: "toggle",
          icon: <Clock size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: preferences.chronologicalFeed,
          onToggle: (value) =>
            handlePreferenceChange("chronologicalFeed", value),
        },
        {
          id: "autoRefresh",
          title: "Auto refresh",
          description: "Automatically refresh feed with new posts",
          type: "toggle",
          icon: <Zap size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: preferences.autoRefresh,
          onToggle: (value) => handlePreferenceChange("autoRefresh", value),
        },
      ],
    },
    {
      id: "actions",
      title: "Actions",
      items: [
        {
          id: "reset",
          title: "Reset to defaults",
          description: "Reset all feed preferences to their default values",
          type: "action",
          icon: <RefreshCw size={20} color="#ff3b30" />,
          onPress: resetToDefaults,
          destructive: true,
        },
      ],
    },
  ];

  const renderPreferenceItem = (item: FeedPreferenceItem) => {
    return (
      <View
        key={item.id}
        style={[styles.preferenceItem, isDarkMode && styles.darkPreferenceItem]}
      >
        <View style={styles.itemContent}>
          <View style={styles.itemIcon}>{item.icon}</View>
          <View style={styles.itemText}>
            <Text
              style={[
                styles.itemTitle,
                isDarkMode && styles.darkText,
                item.destructive && styles.destructiveText,
              ]}
            >
              <Trans>{item.title}</Trans>
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.itemDescription,
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
            value={item.value}
            onValueChange={item.onToggle}
            thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
            trackColor={{
              false: isDarkMode ? "#39393d" : "#767577",
              true: "#007AFF",
            }}
          />
        )}

        {item.type === "action" && (
          <Button
            variant={item.destructive ? "destructive" : "secondary"}
            size="small"
            title={item.destructive ? "Reset" : "Configure"}
            onPress={item.onPress}
          />
        )}
      </View>
    );
  };

  const renderSection = (section: FeedSection) => {
    return (
      <View key={section.id} style={styles.section}>
        <Text
          style={[styles.sectionTitle, isDarkMode && styles.darkSecondaryText]}
        >
          <Trans>{section.title}</Trans>
        </Text>
        {section.description && (
          <Text
            style={[
              styles.sectionDescription,
              isDarkMode && styles.darkSecondaryText,
            ]}
          >
            <Trans>{section.description}</Trans>
          </Text>
        )}
        <View
          style={[
            styles.sectionContent,
            isDarkMode && styles.darkSectionContent,
          ]}
        >
          {section.items.map((item, index) => (
            <View key={item.id}>
              {renderPreferenceItem(item)}
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
      <Header title={t`Home Feed Preferences`} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Home size={24} color="#007AFF" />
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
            <Trans>Customize Your Feed</Trans>
          </Text>
          <Text
            style={[
              styles.headerDescription,
              isDarkMode && styles.darkSecondaryText,
            ]}
          >
            <Trans>
              Control what appears in your home feed and how it behaves.
            </Trans>
          </Text>
        </View>

        {feedSections.map(renderSection)}

        {hasChanges && (
          <View style={styles.saveContainer}>
            <Button
              variant="primary"
              title={t`Save Changes`}
              onPress={savePreferences}
              style={styles.saveButton}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    padding: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 12,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
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
    marginBottom: 4,
    marginLeft: 16,
  },
  sectionDescription: {
    fontSize: 13,
    color: "#8e8e93",
    marginBottom: 8,
    marginLeft: 16,
    lineHeight: 18,
  },
  sectionContent: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    overflow: "hidden",
  },
  darkSectionContent: {
    backgroundColor: "#1c1c1e",
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#ffffff",
  },
  darkPreferenceItem: {
    backgroundColor: "#1c1c1e",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000000",
    marginBottom: 2,
  },
  itemDescription: {
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
  saveContainer: {
    padding: 16,
    marginTop: 16,
  },
  saveButton: {
    width: "100%",
  },
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#8e8e93",
  },
});
