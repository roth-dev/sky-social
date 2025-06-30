import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
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
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("../../../assets/images/icon.png")}
            contentFit="contain"
            style={{ width: 120, height: 120 }}
          />
          <Text style={styles.title}>Welcome to Sky Social</Text>
          <Text style={styles.subtitle}>
            Connect with the decentralized social web
          </Text>
        </View>

        <View style={styles.form}>
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

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={loading ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            disabled={loading}
            style={styles.signInButton}
          />

          <Text style={styles.helpText}>
            Don't have a Bluesky account? Create one at bsky.app
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
    ...Platform.select({
      ios: {
        maxWidth: undefined,
      },
      android: {
        maxWidth: undefined,
      },
      default: {
        maxWidth: 400,
      },
    }),
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  signInButton: {
    marginTop: 8,
  },
  error: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
  },
  helpText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
  },
});
