import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { Image } from "expo-image";

export default function AuthScreen() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(identifier, password);
      if (result.success) {
        router.replace("/(tabs)");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white justify-center items-center"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className={`flex-1 justify-center px-6 ${
        Platform.OS === "web" ? "max-w-md w-full border-l border-r border-gray-200" : ""
      }`}>
        <View className="items-center mb-12">
          <Image
            source={require("../../../assets/images/icon.png")}
            contentFit="contain"
            className="w-30 h-30"
          />
          <Text className="text-3xl font-bold text-gray-900 mt-4 mb-2">Welcome to Sky Social</Text>
          <Text className="text-base text-gray-600 text-center">
            Connect with the decentralized social web
          </Text>
        </View>

        <View className="space-y-4">
          <Input
            label="Username or Email"
            placeholder="your.handle or email@example.com"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text className="text-sm text-red-500 text-center">{error}</Text> : null}

          <Button
            title={loading ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            disabled={loading}
            className="mt-2"
          />

          <Text className="text-sm text-gray-600 text-center mt-4">
            Don't have a Bluesky account? Create one at bsky.app
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}