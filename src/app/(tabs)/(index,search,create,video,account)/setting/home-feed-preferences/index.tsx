import React, { useState, useCallback } from "react";
import { ScrollView } from "react-native";
import { Header } from "@/components/Header";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/Button";
import { View, Text, Dialog, SettingsSection } from "@/components/ui";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import type { SettingsItemProps } from "@/components/ui/SettingsItem";
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
      Dialog.show(t`Success`, t`Your feed preferences have been saved.`, [
        { text: t`OK` },
      ]);
    } catch (error) {
      console.error("Failed to save feed preferences:", error);
      Dialog.show(
        t`Error`,
        t`Failed to save your feed preferences. Please try again.`,
        [{ text: t`OK` }]
      );
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    Dialog.show(
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

  const feedSections: { title: string; items: SettingsItemProps[] }[] = [
    {
      title: t`Content Visibility`,
      items: [
        {
          title: t`Hide replies`,
          description: t`Hide replies from people you don't follow`,
          type: "toggle" as const,
          icon: (
            <MessageSquare
              size={20}
              color={isDarkMode ? "#ffffff" : "#666666"}
            />
          ),
          value: preferences.hideReplies,
          onToggle: (value: boolean) =>
            handlePreferenceChange("hideReplies", value),
        },
        {
          title: t`Hide reposts`,
          description: t`Hide reposts from your timeline`,
          type: "toggle" as const,
          icon: <Repeat size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: preferences.hideReposts,
          onToggle: (value: boolean) =>
            handlePreferenceChange("hideReposts", value),
        },
        {
          title: t`Show quote posts`,
          description: t`Display quote posts in your feed`,
          type: "toggle" as const,
          icon: <Quote size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: preferences.showQuotePosts,
          onToggle: (value: boolean) =>
            handlePreferenceChange("showQuotePosts", value),
        },
        {
          title: t`Show adult content`,
          description: t`Display posts marked as adult content`,
          type: "toggle" as const,
          icon: <Eye size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: preferences.adultContentEnabled,
          onToggle: (value: boolean) =>
            handlePreferenceChange("adultContentEnabled", value),
        },
        {
          title: t`Show muted content`,
          description: t`Display content from muted users with a warning`,
          type: "toggle" as const,
          icon: <EyeOff size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: preferences.showMutedContent,
          onToggle: (value: boolean) =>
            handlePreferenceChange("showMutedContent", value),
        },
      ],
    },
    {
      title: t`Feed Behavior`,
      items: [
        {
          title: t`Chronological feed`,
          description: t`Show posts in chronological order instead of algorithmic`,
          type: "toggle" as const,
          icon: <Clock size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: preferences.chronologicalFeed,
          onToggle: (value: boolean) =>
            handlePreferenceChange("chronologicalFeed", value),
        },
        {
          title: t`Auto refresh`,
          description: t`Automatically refresh feed with new posts`,
          type: "toggle" as const,
          icon: <Zap size={20} color={isDarkMode ? "#ffffff" : "#666666"} />,
          value: preferences.autoRefresh,
          onToggle: (value: boolean) =>
            handlePreferenceChange("autoRefresh", value),
        },
      ],
    },
    {
      title: t`Actions`,
      items: [
        {
          title: t`Reset to defaults`,
          description: t`Reset all feed preferences to their default values`,
          type: "button" as const,
          icon: <RefreshCw size={20} color="#ff3b30" />,
          onPress: resetToDefaults,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <Header title={t`Home Feed Preferences`} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
          <View className="items-center mb-4">
            <Home size={24} color="#007AFF" />
          </View>
          <Text className="text-lg font-semibold text-black dark:text-white text-center mb-2">
            <Trans>Customize Your Feed</Trans>
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
            <Trans>
              Control what appears in your home feed and how it behaves.
            </Trans>
          </Text>
        </View>

        {feedSections.map((section, index) => (
          <SettingsSection
            key={index}
            title={section.title}
            items={section.items}
          />
        ))}

        {hasChanges && (
          <View className="mt-6">
            <Button
              variant="primary"
              title={t`Save Changes`}
              onPress={savePreferences}
              className="w-full"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
