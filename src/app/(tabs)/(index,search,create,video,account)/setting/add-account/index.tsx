import React, { useCallback, useState } from "react";
import { ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { Text, View, VStack, Dialog } from "@/components/ui";
import { Trans } from "@lingui/react/macro";
import { router } from "expo-router";
import { Header } from "@/components/Header";
import { atprotoClient } from "@/lib/atproto";
import { storage } from "@/lib/storage";

export default function AddAccountScreen() {
  const { user: currentUser, refreshUser } = useAuth();
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
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <Header title="Add Account" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
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
                <View className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mt-4">
                  <Text size="sm" font="semiBold" className="mb-2">
                    <Trans>Currently signed in as:</Trans>
                  </Text>
                  <Text font="semiBold" className="mb-1">
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
                <Text className="text-sm text-red-500 dark:text-red-400 text-center mb-4">
                  {error}
                </Text>
              ) : null}

              <Button
                font="semiBold"
                title={loading ? "Adding Account..." : "Add Account"}
                onPress={handleAddAccount}
                disabled={!identifier.trim() || !password.trim() || loading}
                variant="primary"
                className="mt-2"
              />
            </VStack>

            <Text size="sm" className="text-gray-500 text-center mt-6">
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
