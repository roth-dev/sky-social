import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Text, View } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { User, Camera } from "lucide-react-native";
import { router } from "expo-router";

export default function EditProfileScreen() {
  const { user } = useAuth();
  const { isDarkMode } = useSettings();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.description || "");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Display name cannot be empty");
      return;
    }

    try {
      setSaving(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [displayName]);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  const handleChangeAvatar = useCallback(() => {
    Alert.alert("Change Avatar", "Avatar change functionality coming soon!");
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDarkMode && styles.darkContainer]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header
        title={t`Edit Profile`}
        renderRight={() => (
          <Button
            title={t`Save`}
            variant="primary"
            size="small"
            onPress={handleSave}
            disabled={saving}
          />
        )}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View style={styles.section}>
          <View
            style={[
              styles.avatarSection,
              isDarkMode && styles.darkAvatarSection,
            ]}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={48} color={isDarkMode ? "#ffffff" : "#666666"} />
              </View>
              <Button
                variant="ghost"
                size="icon"
                style={styles.changeAvatarButton}
                onPress={handleChangeAvatar}
              >
                <Camera size={20} color="#007AFF" />
              </Button>
            </View>
            <Text
              style={[
                styles.avatarText,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              <Trans>Tap to change your profile picture</Trans>
            </Text>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode && styles.darkSecondaryText,
            ]}
          >
            <Trans>Profile Information</Trans>
          </Text>

          <View
            style={[styles.formSection, isDarkMode && styles.darkFormSection]}
          >
            {/* Display Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
                <Trans>Display Name</Trans>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  isDarkMode && styles.darkTextInput,
                  isDarkMode && styles.darkTextInputText,
                ]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
                placeholderTextColor={isDarkMode ? "#8e8e93" : "#8e8e93"}
                maxLength={50}
                editable={!saving}
              />
              <Text
                style={[
                  styles.characterCount,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                {displayName.length}/50
              </Text>
            </View>

            <View
              style={[styles.separator, isDarkMode && styles.darkSeparator]}
            />

            {/* Bio */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
                <Trans>Bio</Trans>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.bioInput,
                  isDarkMode && styles.darkTextInput,
                  isDarkMode && styles.darkTextInputText,
                ]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell people about yourself"
                placeholderTextColor={isDarkMode ? "#8e8e93" : "#8e8e93"}
                multiline
                numberOfLines={4}
                maxLength={300}
                editable={!saving}
                textAlignVertical="top"
              />
              <Text
                style={[
                  styles.characterCount,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                {bio.length}/300
              </Text>
            </View>
          </View>
        </View>

        {/* Account Info (Read-only) */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode && styles.darkSecondaryText,
            ]}
          >
            <Trans>Account Information</Trans>
          </Text>

          <View
            style={[styles.formSection, isDarkMode && styles.darkFormSection]}
          >
            {/* Handle */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
                <Trans>Handle</Trans>
              </Text>
              <View
                style={[
                  styles.readOnlyInput,
                  isDarkMode && styles.darkReadOnlyInput,
                ]}
              >
                <Text
                  style={[styles.readOnlyText, isDarkMode && styles.darkText]}
                >
                  @{user?.handle || "unknown"}
                </Text>
              </View>
              <Text
                style={[
                  styles.helpText,
                  isDarkMode && styles.darkSecondaryText,
                ]}
              >
                <Trans>Your handle cannot be changed</Trans>
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <View style={styles.buttonContainer}>
            <Button
              title={saving ? t`Saving...` : t`Save Changes`}
              variant="primary"
              onPress={handleSave}
              disabled={saving || !displayName.trim()}
              style={styles.saveButton}
            />

            <Button
              title={t`Cancel`}
              variant="secondary"
              onPress={handleCancel}
              disabled={saving}
              style={styles.cancelButton}
            />
          </View>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
            <Text
              style={[styles.infoText, isDarkMode && styles.darkSecondaryText]}
            >
              <Trans>
                Changes to your profile may take a few minutes to appear
                throughout the platform.
              </Trans>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 24,
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
  avatarSection: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 24,
    alignItems: "center",
  },
  darkAvatarSection: {
    backgroundColor: "#1c1c1e",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  changeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    color: "#8e8e93",
    textAlign: "center",
  },
  formSection: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    overflow: "hidden",
  },
  darkFormSection: {
    backgroundColor: "#1c1c1e",
  },
  inputGroup: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    minHeight: 44,
  },
  darkTextInput: {
    backgroundColor: "#2c2c2e",
    borderColor: "#38383a",
  },
  darkTextInputText: {
    color: "#ffffff",
  },
  bioInput: {
    minHeight: 100,
    maxHeight: 150,
  },
  characterCount: {
    fontSize: 12,
    color: "#8e8e93",
    textAlign: "right",
    marginTop: 4,
  },
  readOnlyInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    minHeight: 44,
    justifyContent: "center",
  },
  darkReadOnlyInput: {
    backgroundColor: "#2c2c2e",
    borderColor: "#38383a",
  },
  readOnlyText: {
    fontSize: 16,
    color: "#666666",
  },
  helpText: {
    fontSize: 12,
    color: "#8e8e93",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginHorizontal: 16,
  },
  darkSeparator: {
    backgroundColor: "#38383a",
  },
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    width: "100%",
  },
  cancelButton: {
    width: "100%",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
  },
  darkInfoCard: {
    backgroundColor: "#1c1c1e",
  },
  infoText: {
    fontSize: 14,
    color: "#8e8e93",
    lineHeight: 20,
    textAlign: "center",
  },
  darkText: {
    color: "#ffffff",
  },
  darkSecondaryText: {
    color: "#8e8e93",
  },
});
