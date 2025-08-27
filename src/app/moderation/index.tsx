import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, ScrollView, Platform, Alert, Switch } from "react-native";
import { Header } from "@/components/Header";
import { useSettings } from "@/contexts/SettingsContext";
import { Text, View } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { router } from "expo-router";
import {
  Shield,
  Users,
  MessageSquareX,
  Eye,
  EyeOff,
  AlertTriangle,
  UserX,
  Flag,
  Settings,
  ChevronRight,
} from "lucide-react-native";
import { useModerationAPI } from "@/hooks/useModerationAPI";

interface ModerationSection {
  id: string;
  title: string;
  description?: string;
  items: ModerationItem[];
}

interface ModerationItem {
  id: string;
  title: string;
  description?: string;
  type: "toggle" | "navigate" | "action";
  icon?: React.ReactNode;
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  showChevron?: boolean;
  destructive?: boolean;
}

export default function ModerationScreen() {
  const { isDarkMode } = useSettings();
  const {
    getModerationPreferences,
    updateModerationPreferences,
    getMutedWords,
    getBlockedUsers,
    getMutedUsers,
  } = useModerationAPI();

  // Moderation preferences state
  const [adultContentEnabled, setAdultContentEnabled] = useState(false);
  const [hideReposts, setHideReposts] = useState(false);
  const [hideReplies, setHideReplies] = useState(false);
  const [requireFollowToMention, setRequireFollowToMention] = useState(false);
  const [labelsEnabled, setLabelsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load moderation preferences on mount
  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const preferences = await getModerationPreferences();
      if (preferences) {
        setAdultContentEnabled(preferences.adultContentEnabled);
        setHideReposts(preferences.hideReposts);
        setHideReplies(preferences.hideReplies);
        setRequireFollowToMention(preferences.requireFollowToMention);
        setLabelsEnabled(preferences.labelsEnabled);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
      Alert.alert("Error", "Failed to load moderation preferences");
    } finally {
      setLoading(false);
    }
  }, [getModerationPreferences]);

  // Update preferences when toggles change
  const updatePreferences = useCallback(
    async (newPreferences: Record<string, boolean>) => {
      try {
        const success = await updateModerationPreferences(newPreferences);
        if (!success) {
          Alert.alert("Error", "Failed to update preferences");
        }
      } catch (error) {
        console.error("Failed to update preferences:", error);
        Alert.alert("Error", "Failed to update preferences");
      }
    },
    [updateModerationPreferences]
  );

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const handleBlockedUsers = useCallback(() => {
    router.push("/moderation/blocked-users");
  }, []);

  const handleMutedUsers = useCallback(() => {
    Alert.alert("Muted Users", "Muted users management coming soon!", [
      { text: "OK" },
    ]);
  }, []);

  const handleMutedWords = useCallback(() => {
    Alert.alert("Muted Words", "Muted words management coming soon!", [
      { text: "OK" },
    ]);
  }, []);

  const handleContentFiltering = useCallback(() => {
    Alert.alert(
      "Content Filtering",
      "Advanced content filtering coming soon!",
      [{ text: "OK" }]
    );
  }, []);

  const handleLabelingServices = useCallback(() => {
    Alert.alert(
      "Labeling Services",
      "Labeling services management coming soon!",
      [{ text: "OK" }]
    );
  }, []);

  const handleReportHistory = useCallback(() => {
    Alert.alert("Report History", "Report history coming soon!", [
      { text: "OK" },
    ]);
  }, []);

  // Toggle handlers that update preferences
  const handleAdultContentToggle = useCallback(
    async (value: boolean) => {
      setAdultContentEnabled(value);
      await updatePreferences({ adultContentEnabled: value });
    },
    [updatePreferences]
  );

  const handleHideRepostsToggle = useCallback(
    async (value: boolean) => {
      setHideReposts(value);
      await updatePreferences({ hideReposts: value });
    },
    [updatePreferences]
  );

  const handleHideRepliesToggle = useCallback(
    async (value: boolean) => {
      setHideReplies(value);
      await updatePreferences({ hideReplies: value });
    },
    [updatePreferences]
  );

  const handleRequireFollowToggle = useCallback(
    async (value: boolean) => {
      setRequireFollowToMention(value);
      await updatePreferences({ requireFollowToMention: value });
    },
    [updatePreferences]
  );

  const handleLabelsToggle = useCallback(
    async (value: boolean) => {
      setLabelsEnabled(value);
      await updatePreferences({ labelsEnabled: value });
    },
    [updatePreferences]
  );

  const sections: ModerationSection[] = [
    {
      id: "content-filtering",
      title: "Content Filtering",
      description: "Control what content you see on your timeline",
      items: [
        {
          id: "adult-content",
          title: "Show adult content",
          description: "Show posts that may contain adult content",
          type: "toggle",
          icon: <Eye size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: adultContentEnabled,
          onToggle: handleAdultContentToggle,
        },
        {
          id: "hide-reposts",
          title: "Hide reposts",
          description: "Hide reposts from your timeline",
          type: "toggle",
          icon: (
            <MessageSquareX
              size={20}
              color={isDarkMode ? "#ffffff" : "#666666"}
            />
          ),
          value: hideReposts,
          onToggle: handleHideRepostsToggle,
        },
        {
          id: "hide-replies",
          title: "Hide replies",
          description: "Hide reply posts from people you don't follow",
          type: "toggle",
          icon: <EyeOff size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: hideReplies,
          onToggle: handleHideRepliesToggle,
        },
        {
          id: "content-filtering",
          title: "Content filtering",
          description: "Configure advanced content filtering options",
          type: "navigate",
          icon: (
            <Settings size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
          onPress: handleContentFiltering,
          showChevron: true,
        },
      ],
    },
    {
      id: "blocking-muting",
      title: "Blocking & Muting",
      description: "Manage blocked and muted accounts",
      items: [
        {
          id: "blocked-users",
          title: "Blocked accounts",
          description: "Accounts you have blocked",
          type: "navigate",
          icon: <UserX size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleBlockedUsers,
          showChevron: true,
        },
        {
          id: "muted-users",
          title: "Muted accounts",
          description: "Accounts you have muted",
          type: "navigate",
          icon: <Users size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleMutedUsers,
          showChevron: true,
        },
        {
          id: "muted-words",
          title: "Muted words",
          description: "Words and phrases you've muted",
          type: "navigate",
          icon: (
            <MessageSquareX
              size={20}
              color={isDarkMode ? "#ffffff" : "#666666"}
            />
          ),
          onPress: handleMutedWords,
          showChevron: true,
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacy",
      description: "Control who can interact with you",
      items: [
        {
          id: "require-follow-mention",
          title: "Require follow to mention",
          description: "Only people you follow can mention you",
          type: "toggle",
          icon: <Users size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: requireFollowToMention,
          onToggle: setRequireFollowToMention,
        },
      ],
    },
    {
      id: "labeling",
      title: "Labeling Services",
      description: "Configure content labeling and moderation services",
      items: [
        {
          id: "labels-enabled",
          title: "Enable content labels",
          description: "Show content warnings and labels",
          type: "toggle",
          icon: (
            <AlertTriangle
              size={20}
              color={isDarkMode ? "#ffffff" : "#666666"}
            />
          ),
          value: labelsEnabled,
          onToggle: setLabelsEnabled,
        },
        {
          id: "labeling-services",
          title: "Labeling services",
          description: "Manage external labeling services",
          type: "navigate",
          icon: <Flag size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleLabelingServices,
          showChevron: true,
        },
      ],
    },
    {
      id: "reporting",
      title: "Reporting",
      description: "Your report history and options",
      items: [
        {
          id: "report-history",
          title: "Report history",
          description: "View your submitted reports",
          type: "navigate",
          icon: <Flag size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleReportHistory,
          showChevron: true,
        },
      ],
    },
  ];

  const renderModerationItem = (item: ModerationItem) => {
    return (
      <View key={item.id} style={[styles.item, isDarkMode && styles.darkItem]}>
        <View style={styles.itemContent}>
          <View style={styles.itemLeft}>
            {item.icon && <View style={styles.itemIcon}>{item.icon}</View>}
            <View style={styles.itemText}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>
                {item.title}
              </Text>
              {item.description && (
                <Text
                  style={[
                    styles.itemDescription,
                    isDarkMode && styles.darkSecondaryText,
                  ]}
                >
                  {item.description}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.itemRight}>
            {item.type === "toggle" && (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{
                  false: isDarkMode ? "#3c3c43" : "#e5e5ea",
                  true: "#007AFF",
                }}
                thumbColor={Platform.OS === "ios" ? undefined : "#ffffff"}
              />
            )}
            {item.type === "navigate" && item.showChevron && (
              <ChevronRight
                size={20}
                color={isDarkMode ? "#8e8e93" : "#c7c7cc"}
              />
            )}
          </View>
        </View>
        {(item.type === "navigate" || item.type === "action") && (
          <Button
            variant="ghost"
            style={styles.itemButton}
            onPress={item.onPress}
            accessibilityLabel={item.title}
          />
        )}
      </View>
    );
  };

  const renderSection = (section: ModerationSection) => {
    return (
      <View
        key={section.id}
        style={[styles.section, isDarkMode && styles.darkSection]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            {section.title}
          </Text>
          {section.description && (
            <Text
              style={[
                styles.sectionDescription,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              {section.description}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.sectionContent,
            isDarkMode && styles.darkSectionContent,
          ]}
        >
          {section.items.map(renderModerationItem)}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Header title={t`Moderation`} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View
            style={[styles.headerCard, isDarkMode && styles.darkHeaderCard]}
          >
            <View style={styles.headerIcon}>
              <Shield size={32} color={isDarkMode ? "#ffffff" : "#007AFF"} />
            </View>
            <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
              <Trans>Moderation Settings</Trans>
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              <Trans>
                Control your experience by managing content filtering, blocking,
                and privacy settings
              </Trans>
            </Text>
          </View>

          {/* Moderation Sections */}
          {sections.map(renderSection)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
  },

  // Header Card
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  darkHeaderCard: {
    backgroundColor: "#1c1c1e",
    shadowOpacity: 0.3,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0f8ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1d1d1f",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#6e6e73",
    lineHeight: 22,
    textAlign: "center",
  },

  // Sections
  section: {
    backgroundColor: "transparent",
  },
  darkSection: {
    backgroundColor: "transparent",
  },
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6e6e73",
    lineHeight: 20,
  },
  sectionContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  darkSectionContent: {
    backgroundColor: "#1c1c1e",
    shadowOpacity: 0.2,
  },

  // Items
  item: {
    backgroundColor: "transparent",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5ea",
    position: "relative",
  },
  darkItem: {
    borderBottomColor: "#38383a",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 60,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    marginRight: 12,
    width: 24,
    alignItems: "center",
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1d1d1f",
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 13,
    color: "#6e6e73",
    lineHeight: 18,
  },
  itemRight: {
    marginLeft: 12,
  },
  itemButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    borderRadius: 0,
  },

  // Dark mode text
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#8e8e93",
  },
});
