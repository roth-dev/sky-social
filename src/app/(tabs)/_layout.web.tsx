import { Tabs } from "expo-router";
import { ResponsiveTabBar } from "@/components/layout/ResponsiveTabBar";
import SearchScreen from "./(index,search,create,video,account)/search";
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
    <View className="flex-1 flex-row bg-white">
      {/* Desktop Sidebar */}
      <WebSidebar />

      {/* Main Content Area */}
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
          <Tabs.Screen name="account" />
        </Tabs>
      </View>

      {/* Right Panel for Search (when not authenticated) */}
      <View
        className="hidden lg:flex lg:w-80 lg:border-l"
        style={{
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: Colors.border[colorScheme],
        }}
      >
        {!isAuthenticated && <SearchScreen />}
      </View>

      {/* Mobile Tab Bar */}
      <ResponsiveTabBar />
    </View>
  );
}
