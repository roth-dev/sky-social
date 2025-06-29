import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";

export default function NotificationsScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        {Platform.OS !== "web" && <Header title="Notifications" />}
        <View style={styles.notAuthenticatedContainer}>
          <Text style={styles.notAuthenticatedTitle}>Stay updated</Text>
          <Text style={styles.notAuthenticatedText}>
            Sign in to see your notifications and stay connected with the
            community.
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push("/login")}
            variant="primary"
            size="large"
            style={styles.signInButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== "web" && <Header title="Notifications" />}
      <ScrollView style={styles.content}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No notifications yet</Text>
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
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  notAuthenticatedTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  signInButton: {
    paddingHorizontal: 32,
  },
});
