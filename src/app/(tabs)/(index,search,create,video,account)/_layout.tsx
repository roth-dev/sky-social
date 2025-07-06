import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { Stack } from "expo-router";
import React from "react";

export const unstable_settings = {
  initialRouteName: "index",
  search: {
    initialRouteName: "search",
  },
  create: {
    initialRouteName: "create",
  },
  video: {
    initialRouteName: "video",
  },
  account: {
    initialRouteName: "account",
  },
};

export default function TabLayout() {
  const { colorScheme } = useSettings();
  return (
    <Stack
      screenOptions={{
        gestureDirection: "horizontal",
        animation: "ios_from_right",
        headerStyle: {
          backgroundColor: Colors.background.primary[colorScheme],
        },
        headerTitleStyle: {
          fontSize: 16,
          fontFamily: "Inter_600SemiBold",
        },
        headerShown: false,
        // headerLeft: () => (isIOS ? <BackButton /> : undefined),
      }}
    />
  );
}
