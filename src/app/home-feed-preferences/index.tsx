import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, ScrollView, Alert, Switch } from "react-native";
import { Stack } from "expo-router";
import { Header } from "@/components/Header";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/Button";
import { View, Text } from "@/components/ui";
import Loading from "@/components/ui/Loading";
import { useModerationAPI } from "@/hooks/useModerationAPI";
import { t } from "@lingui/core/macro";

interface FeedPreferences {
  hideReplies: boolean;
  hideReposts: boolean;
  adultContentEnabled: boolean;
  showQuotePosts: boolean;
  chronologicalFeed: boolean;
}

export default function HomeFeedPreferencesScreen() {
  const { isDarkMode } = useSettings();
  const { getModerationPreferences, updateModerationPreferences } =
    useModerationAPI();

  const [preferences, setPreferences] = useState<FeedPreferences>({
    hideReplies: false,
    hideReposts: false,
    adultContentEnabled: false,
    showQuotePosts: true,
    chronologicalFeed: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current preferences
  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const prefs = await getModerationPreferences();

      if (prefs) {
        setPreferences({
          hideReplies: prefs.hideReplies,
          hideReposts: prefs.hideReposts,
          adultContentEnabled: prefs.adultContentEnabled,
          showQuotePosts: true, // Default for now, not available in current API
          chronologicalFeed: false, // Default for now, not available in current API
        });
      }
    } catch (error) {
      console.error("Failed to load feed preferences:", error);
      Alert.alert(
        t`Error`,
        t`Failed to load your feed preferences. Please try again.`,
        [{ text: t`OK` }]
      );
    } finally {
      setLoading(false);
    }
  }, [getModerationPreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const handlePreferenceChange = (
    key: keyof FeedPreferences,
    value: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const savePreferences = async () => {
    try {
      setSaving(true);

      const success = await updateModerationPreferences({
        hideReplies: preferences.hideReplies,
        hideReposts: preferences.hideReposts,
        adultContentEnabled: preferences.adultContentEnabled,
      });

      if (success) {
        setHasChanges(false);
        Alert.alert(t`Success`, t`Your feed preferences have been saved.`, [
          { text: t`OK` },
        ]);
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Failed to save feed preferences:", error);
      Alert.alert(
        t`Error`,
        t`Failed to save your feed preferences. Please try again.`,
        [{ text: t`OK` }]
      );
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      t`Reset to Defaults`,
      t`Are you sure you want to reset all feed preferences to their default values?`,
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
            });
            setHasChanges(true);
          },
        },
      ]
    );
  };

  const renderSettingRow = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={[styles.settingRow, isDarkMode && styles.darkSettingRow]}>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>
          {title}
        </Text>
        <Text
          style={[
            styles.settingDescription,
            isDarkMode && styles.darkSecondaryText,
          ]}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
        trackColor={{
          false: isDarkMode ? "#39393d" : "#767577",
          true: "#007AFF",
        }}
      />
    </View>
  );

  const renderSectionHeader = (title: string, description: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          isDarkMode && styles.darkSecondaryText,
        ]}
      >
        {description}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title={t`Home Feed Preferences`} />
        <View style={styles.loadingContainer}>
          <Loading size="large" />
          <Text
            style={[styles.loadingText, isDarkMode && styles.darkSecondaryText]}
          >
            {t`Loading preferences...`}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title={t`Home Feed Preferences`} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Feed Content Section */}
        {renderSectionHeader(
          t`Feed Content`,
          t`Control what content appears in your home timeline`
        )}

        <View style={[styles.section, isDarkMode && styles.darkSection]}>
          {renderSettingRow(
            t`Hide replies`,
            t`Don't show replies to posts in your timeline`,
            preferences.hideReplies,
            (value) => handlePreferenceChange("hideReplies", value)
          )}

          <View
            style={[styles.separator, isDarkMode && styles.darkSeparator]}
          />

          {renderSettingRow(
            t`Hide reposts`,
            t`Don't show reposts in your timeline`,
            preferences.hideReposts,
            (value) => handlePreferenceChange("hideReposts", value)
          )}

          <View
            style={[styles.separator, isDarkMode && styles.darkSeparator]}
          />

          {renderSettingRow(
            t`Show quote posts`,
            t`Show posts that quote other posts`,
            preferences.showQuotePosts,
            (value) => handlePreferenceChange("showQuotePosts", value)
          )}
        </View>

        {/* Feed Ordering Section */}
        {renderSectionHeader(
          t`Feed Ordering`,
          t`Choose how your timeline is organized`
        )}

        <View style={[styles.section, isDarkMode && styles.darkSection]}>
          {renderSettingRow(
            t`Chronological feed`,
            t`Show posts in chronological order instead of algorithmic order`,
            preferences.chronologicalFeed,
            (value) => handlePreferenceChange("chronologicalFeed", value)
          )}
        </View>

        {/* Content Filtering Section */}
        {renderSectionHeader(
          t`Content Filtering`,
          t`Control mature and sensitive content`
        )}

        <View style={[styles.section, isDarkMode && styles.darkSection]}>
          {renderSettingRow(
            t`Show adult content`,
            t`Allow mature and adult content to appear in your feed`,
            preferences.adultContentEnabled,
            (value) => handlePreferenceChange("adultContentEnabled", value)
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title={saving ? t`Saving...` : t`Save Changes`}
            onPress={savePreferences}
            disabled={!hasChanges || saving}
            variant="primary"
          />

          <Button
            title={t`Reset to Defaults`}
            onPress={resetToDefaults}
            variant="ghost"
          />
        </View>

        <View style={styles.footerText}>
          <Text
            style={[
              styles.footerDescription,
              isDarkMode && styles.darkSecondaryText,
            ]}
          >
            {t`Changes to your feed preferences will take effect immediately. Some changes may require refreshing your timeline.`}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#666666",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  darkSection: {
    backgroundColor: "#1c1c1e",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  darkSettingRow: {
    backgroundColor: "#1c1c1e",
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e5e7",
    marginLeft: 16,
  },
  darkSeparator: {
    backgroundColor: "#38383a",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },
  footerText: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  footerDescription: {
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
    lineHeight: 18,
  },
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#99999b",
  },
});
