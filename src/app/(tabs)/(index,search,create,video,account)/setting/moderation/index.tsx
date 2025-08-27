import React, { useState, useCallback } from "react";
import { StyleSheet, ScrollView, Alert, Switch } from "react-native";
import { Header } from "@/components/Header";
import { useSettings } from "@/contexts/SettingsContext";
import { Text, View } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
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

  // Moderation preferences state
  const [adultContentEnabled, setAdultContentEnabled] = useState(false);
  const [hideReposts, setHideReposts] = useState(false);
  const [hideReplies, setHideReplies] = useState(false);
  const [requireFollowToMention, setRequireFollowToMention] = useState(false);
  const [labelsEnabled, setLabelsEnabled] = useState(true);
  const [loading] = useState(false);

  const handleMutedWords = useCallback(() => {
    Alert.alert("Muted Words", "Muted words management coming soon!");
  }, []);

  const handleBlockedUsers = useCallback(() => {
    Alert.alert("Blocked Users", "Blocked users management coming soon!");
  }, []);

  const handleMutedUsers = useCallback(() => {
    Alert.alert("Muted Users", "Muted users management coming soon!");
  }, []);

  const handleContentLabels = useCallback(() => {
    Alert.alert("Content Labels", "Content labels settings coming soon!");
  }, []);

  const handleReports = useCallback(() => {
    Alert.alert("Reports", "Report management coming soon!");
  }, []);

  const moderationSections: ModerationSection[] = [
    {
      id: "content-filtering",
      title: "Content Filtering",
      description: "Control what content appears in your feeds",
      items: [
        {
          id: "adult-content",
          title: "Show adult content",
          description: "Show posts marked as adult content",
          type: "toggle",
          icon: <Eye size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: adultContentEnabled,
          onToggle: setAdultContentEnabled,
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
          onToggle: setHideReposts,
        },
        {
          id: "hide-replies",
          title: "Hide replies",
          description: "Hide replies from people you don't follow",
          type: "toggle",
          icon: <EyeOff size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: hideReplies,
          onToggle: setHideReplies,
        },
        {
          id: "content-labels",
          title: "Content labels",
          description: "Manage warning labels on content",
          type: "navigate",
          icon: <Flag size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleContentLabels,
          showChevron: true,
        },
      ],
    },
    {
      id: "interactions",
      title: "Interactions",
      description: "Control who can interact with you",
      items: [
        {
          id: "require-follow-mention",
          title: "Require follow to mention",
          description: "Only allow mentions from people you follow",
          type: "toggle",
          icon: <Users size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: requireFollowToMention,
          onToggle: setRequireFollowToMention,
        },
        {
          id: "labels",
          title: "Enable content labels",
          description: "Show warning labels on potentially sensitive content",
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
      ],
    },
    {
      id: "blocked-muted",
      title: "Blocked & Muted",
      description: "Manage blocked and muted users and content",
      items: [
        {
          id: "muted-words",
          title: "Muted words",
          description: "Words and phrases you don't want to see",
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
        {
          id: "blocked-users",
          title: "Blocked users",
          description: "Users you've blocked",
          type: "navigate",
          icon: <UserX size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleBlockedUsers,
          showChevron: true,
        },
        {
          id: "muted-users",
          title: "Muted users",
          description: "Users you've muted",
          type: "navigate",
          icon: <Users size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleMutedUsers,
          showChevron: true,
        },
      ],
    },
    {
      id: "reporting",
      title: "Reporting",
      description: "Manage your reports and moderation actions",
      items: [
        {
          id: "my-reports",
          title: "My reports",
          description: "View your submitted reports",
          type: "navigate",
          icon: <Flag size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleReports,
          showChevron: true,
        },
        {
          id: "moderation-settings",
          title: "Advanced moderation",
          description: "Additional moderation tools and settings",
          type: "navigate",
          icon: (
            <Settings size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
          onPress: () =>
            Alert.alert(
              "Advanced Moderation",
              "Advanced settings coming soon!"
            ),
          showChevron: true,
        },
      ],
    },
  ];

  const renderModerationItem = (item: ModerationItem) => {
    return (
      <View
        key={item.id}
        style={[styles.moderationItem, isDarkMode && styles.darkModerationItem]}
      >
        <View style={styles.itemContent}>
          {item.icon && <View style={styles.itemIcon}>{item.icon}</View>}
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
            disabled={loading}
            thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
            trackColor={{
              false: isDarkMode ? "#39393d" : "#767577",
              true: "#007AFF",
            }}
          />
        )}

        {item.type === "navigate" && (
          <Button variant="ghost" onPress={item.onPress} disabled={loading}>
            {item.showChevron && (
              <ChevronRight
                size={20}
                color={isDarkMode ? "#666666" : "#999999"}
              />
            )}
          </Button>
        )}

        {item.type === "action" && (
          <Button
            variant={item.destructive ? "destructive" : "secondary"}
            size="small"
            title={item.destructive ? "Delete" : "Manage"}
            onPress={item.onPress}
            disabled={loading}
          />
        )}
      </View>
    );
  };

  const renderSection = (section: ModerationSection) => {
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
              {renderModerationItem(item)}
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
      <Header title={t`Moderation`} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Shield size={24} color="#007AFF" />
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
            <Trans>Content Moderation</Trans>
          </Text>
          <Text
            style={[
              styles.headerDescription,
              isDarkMode && styles.darkSecondaryText,
            ]}
          >
            <Trans>
              Control what content you see and who can interact with you on Sky
              Social.
            </Trans>
          </Text>
        </View>

        {moderationSections.map(renderSection)}
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
  moderationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#ffffff",
  },
  darkModerationItem: {
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
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#8e8e93",
  },
});
