import { Tabs } from "expo-router";
import { ResponsiveTabBar } from "@/components/layout/ResponsiveTabBar";
import SearchScreen from "./search";
import { useAuth } from "@/contexts/AuthContext";
import WebSidebar from "@/components/layout/WebSidebar";
import { View } from "@/components/ui";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";

export default function TabLayout() {
  const { colorScheme } = useSettings();
  const { isAuthenticated } = useAuth();

  return (
    <View className="flex-1 flex-row">
      {/* Desktop Sidebar */}
      <WebSidebar />

      {/* Main Content Area - Centered */}
      <View className="flex-1 main-content-desktop">
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" }, // Hide default tab bar on web
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="search" />
          <Tabs.Screen name="create" />
          <Tabs.Screen name="video" />
          <Tabs.Screen name="profile" />
          <Tabs.Screen name="settings" />
        </Tabs>
      </View>

      {/* Right Panel for Search/Trending */}
      <View className="right-sidebar-desktop">
        {!isAuthenticated && <SearchScreen />}
      </View>

      {/* Mobile Tab Bar */}
      <ResponsiveTabBar />
    </View>
  );
}