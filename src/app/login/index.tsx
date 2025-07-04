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
import { Image } from "expo-image";
import { Text, View, VStack } from "@/components/ui";
import { useSettings } from "@/contexts/SettingsContext";

export default function LoginScreen() {
  const { themeMode } = useSettings();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = useCallback(async () => {
    if (!identifier.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(identifier, password);
      if (result.success) {
        // Login successful, user will be redirected automatically
        setIdentifier("");
        setPassword("");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [identifier, password]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-1 justify-center"
        >
          <View className="justify-center border-gray-500 rounded-md  md:w-96 md:border md:p-4 self-center mx-4">
            <VStack className="items-center mb-4">
              <Image
                source={require("../../../assets/images/icon.png")}
                style={styles.logo}
                contentFit="contain"
              />
              <Text size="xl" font="bold">
                Welcome to Sky
              </Text>
              <Text font="normal" className="text-gray-500">
                Connect with the decentralized social web
              </Text>
            </VStack>

            <VStack className="gap-4">
              <Input
                label="Username or Email"
                placeholder="your.handle or email@example.com"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                autoCorrect={false}
                className="dark:text-white"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={error}
                className="dark:text-white"
              />
              <Button
                title={loading ? "Signing in..." : "Sign In"}
                onPress={handleLogin}
                disabled={loading}
              />

              <Text style={styles.signupText}>
                Don't have a Bluesky account? Create one at bsky.app
              </Text>
            </VStack>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 8,
  },
  signupText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },
});
