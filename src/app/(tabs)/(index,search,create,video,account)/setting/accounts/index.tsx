import React from "react";
import { View, ScrollView, Platform } from "react-native";
import { Header } from "@/components/Header";
import { AccountSelector } from "@/components/settings/AccountSelector";
import { router } from "expo-router";

export default function AccountsScreen() {
  const handleAddAccount = () => {
    router.push("/setting/add-account");
  };

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      {Platform.OS !== "web" && <Header title="Accounts" />}

      <ScrollView className="flex-1 pt-5" showsVerticalScrollIndicator={false}>
        <AccountSelector onAddAccount={handleAddAccount} />
      </ScrollView>
    </View>
  );
}
