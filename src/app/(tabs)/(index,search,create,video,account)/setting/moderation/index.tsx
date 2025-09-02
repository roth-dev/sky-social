import React, { useState, useCallback } from "react";
import { ScrollView } from "react-native";
import { Header } from "@/components/Header";
import { useSettings } from "@/contexts/SettingsContext";
import { Text, View, Dialog, SettingsSection } from "@/components/ui";
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
} from "lucide-react-native";

interface ModerationSection {
  title: string;
  description?: string;
  items: ModerationItem[];
}

interface ModerationItem {
  title: string;
  description?: string;
  type: "toggle" | "button" | "info" | "navigation";
  icon: React.ReactNode;
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
  disabled?: boolean;
}

export default function ModerationScreen() {
  const { isDarkMode } = useSettings();

  // Moderation preferences state
  const [adultContentEnabled, setAdultContentEnabled] = useState(false);
  const [hideReposts, setHideReposts] = useState(false);
  const [hideReplies, setHideReplies] = useState(false);
  const [requireFollowToMention, setRequireFollowToMention] = useState(false);
  const [labelsEnabled, setLabelsEnabled] = useState(true);

  const handleMutedWords = useCallback(() => {
    Dialog.show("Muted Words", "Muted words management coming soon!");
  }, []);

  const handleBlockedUsers = useCallback(() => {
    Dialog.show("Blocked Users", "Blocked users management coming soon!");
  }, []);

  const handleMutedUsers = useCallback(() => {
    Dialog.show("Muted Users", "Muted users management coming soon!");
  }, []);

  const handleContentLabels = useCallback(() => {
    Dialog.show("Content Labels", "Content labels settings coming soon!");
  }, []);

  const handleReports = useCallback(() => {
    Dialog.show("Reports", "Report management coming soon!");
  }, []);

  const moderationSections: ModerationSection[] = [
    {
      title: "Content Filtering",
      description: "Control what content appears in your feeds",
      items: [
        {
          title: "Show adult content",
          description: "Show posts marked as adult content",
          type: "toggle",
          icon: <Eye size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: adultContentEnabled,
          onToggle: setAdultContentEnabled,
        },
        {
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
          title: "Hide replies",
          description: "Hide replies from people you don't follow",
          type: "toggle",
          icon: <EyeOff size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: hideReplies,
          onToggle: setHideReplies,
        },
        {
          title: "Content labels",
          description: "Manage warning labels on content",
          type: "navigation",
          icon: <Flag size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleContentLabels,
        },
      ],
    },
    {
      title: "Interactions",
      description: "Control who can interact with you",
      items: [
        {
          title: "Require follow to mention",
          description: "Only allow mentions from people you follow",
          type: "toggle",
          icon: <Users size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: requireFollowToMention,
          onToggle: setRequireFollowToMention,
        },
        {
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
      title: "Blocked & Muted",
      description: "Manage blocked and muted users and content",
      items: [
        {
          title: "Muted words",
          description: "Words and phrases you don't want to see",
          type: "navigation",
          icon: (
            <MessageSquareX
              size={20}
              color={isDarkMode ? "#ffffff" : "#666666"}
            />
          ),
          onPress: handleMutedWords,
        },
        {
          title: "Blocked users",
          description: "Users you've blocked",
          type: "navigation",
          icon: <UserX size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleBlockedUsers,
        },
        {
          title: "Muted users",
          description: "Users you've muted",
          type: "navigation",
          icon: <Users size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleMutedUsers,
        },
      ],
    },
    {
      title: "Reporting",
      description: "Manage your reports and moderation actions",
      items: [
        {
          title: "My reports",
          description: "View your submitted reports",
          type: "navigation",
          icon: <Flag size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          onPress: handleReports,
        },
        {
          title: "Advanced moderation",
          description: "Additional moderation tools and settings",
          type: "navigation",
          icon: (
            <Settings size={20} color={isDarkMode ? "#ffffff" : "#666666"} />
          ),
          onPress: () =>
            Dialog.show(
              "Advanced Moderation",
              "Advanced settings coming soon!"
            ),
        },
      ],
    },
  ];

  const renderSection = (section: ModerationSection) => {
    return (
      <SettingsSection
        key={section.title}
        title={section.title}
        items={section.items}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <Header title={t`Moderation`} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center p-5 mb-4">
          <Shield size={24} color="#007AFF" />
          <Text className="text-2xl font-bold text-black dark:text-white mt-3 mb-2">
            <Trans>Content Moderation</Trans>
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-400 text-center leading-6">
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
