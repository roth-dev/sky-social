import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { Text, View, VStack, Dialog } from "@/components/ui";
import { useSettings } from "@/contexts/SettingsContext";
import { Trans } from "@lingui/react/macro";
import { router } from "expo-router";
import { Header } from "@/components/Header";
import { atprotoClient } from "@/lib/atproto";
import { storage } from "@/lib/storage";

export default function AddAccountScreen() {
  const { user: currentUser, refreshUser } = useAuth();
  const { isDarkMode } = useSettings();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddAccount = useCallback(async () => {
    if (!identifier.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create a temporary client for the new account
      const tempClient = atprotoClient.createNewInstance();
      const loginResult = await tempClient.login(identifier, password);

      if (loginResult.success) {
        // Get profile for the new account
        const profileResult = await tempClient.getProfile(identifier);

        if (profileResult.success && profileResult.data) {
          const newProfile = profileResult.data;

          // Check if account already exists
          const accounts = await storage.getAccounts();
          if (accounts[newProfile.did]) {
            setError("This account is already added");
            return;
          }

          // Get session data
          const session = tempClient.getCurrentSession();
          if (!session) {
            setError("Failed to get session data");
            return;
          }

          // Save the new account
          await storage.saveAccount(session, newProfile);

          Dialog.show(
            "Account Added",
            `Successfully added ${
              newProfile.displayName || newProfile.handle
            }. You can switch between accounts in Settings.`,
            [
              {
                text: "Switch Now",
                onPress: async () => {
                  await storage.switchAccount(newProfile.did);
                  await refreshUser();
                  router.back();
                },
              },
              {
                text: "Stay on Current",
                onPress: () => router.back(),
              },
            ]
          );
        } else {
          setError("Failed to get profile information");
        }
      } else {
        setError(loginResult.error || "Login failed");
      }
    } catch (error) {
      console.error("Add account error:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [identifier, password, refreshUser]);

  return (
    <View className="flex-1">
      <Header title="Add Account" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <VStack className="p-6">
            <VStack>
              <Text font="semiBold">
                <Trans>Add Another Account</Trans>
              </Text>
              <Text size="sm" className="text-gray-500">
                <Trans>
                  Sign in to add another Bluesky account. You can easily switch
                  between accounts in Settings.
                </Trans>
              </Text>

              {currentUser && (
                <View
                  darkColor="secondary"
                  className="bg-white"
                  style={[styles.currentAccountCard]}
                >
                  <Text size="sm" font="semiBold">
                    <Trans>Currently signed in as:</Trans>
                  </Text>
                  <Text font="semiBold">
                    {currentUser.displayName || currentUser.handle}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    @{currentUser.handle}
                  </Text>
                </View>
              )}
            </VStack>

            <VStack className="gap-4 mt-4">
              <Input
                label="Username or Email"
                value={identifier}
                onChangeText={(text) => {
                  setIdentifier(text);
                  setError("");
                }}
                placeholder="alice.bsky.social or alice@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />

              <Input
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError("");
                }}
                placeholder="Enter your password"
                secureTextEntry
              />

              {error ? (
                <Text
                  style={[styles.errorText, isDarkMode && styles.darkErrorText]}
                >
                  {error}
                </Text>
              ) : null}

              <Button
                font="semiBold"
                title={loading ? "Adding Account..." : "Add Account"}
                onPress={handleAddAccount}
                disabled={!identifier.trim() || !password.trim() || loading}
                variant="primary"
                style={styles.addButton}
              />
            </VStack>

            <Text size="sm" className="text-gray-500 text-center">
              <Trans>
                Your accounts are stored securely on this device. You can manage
                and switch between them in Settings.
              </Trans>
            </Text>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  cancelButton: {
    padding: 8,
  },
  currentAccountCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  darkCard: {
    backgroundColor: "#1c1c1e",
    borderColor: "#333333",
  },
  errorText: {
    fontSize: 14,
    color: "#ff3b30",
    marginBottom: 16,
    textAlign: "center",
  },
  darkErrorText: {
    color: "#ff453a",
  },
  addButton: {
    marginTop: 8,
  },
  infoSection: {
    paddingTop: 20,
  },
});
