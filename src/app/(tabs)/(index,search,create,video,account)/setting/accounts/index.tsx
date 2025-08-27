import React from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import { Header } from "@/components/Header";
import { useSettings } from "@/contexts/SettingsContext";
import { AccountSelector } from "@/components/settings/AccountSelector";
import { router } from "expo-router";

export default function AccountsScreen() {
  const { isDarkMode } = useSettings();

  const handleAddAccount = () => {
    router.push("/setting/add-account");
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {Platform.OS !== "web" && <Header title="Accounts" />}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AccountSelector onAddAccount={handleAddAccount} />
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
    paddingTop: 20,
  },
});
