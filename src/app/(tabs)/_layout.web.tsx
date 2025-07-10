import { Tabs } from "expo-router";
import { ResponsiveTabBar } from "@/components/layout/ResponsiveTabBar";
import WebSidebar from "@/components/layout/WebSidebar";
import { View } from "@/components/ui";

export default function TabLayout() {
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
          <Tabs.Screen name="(index)" />
          <Tabs.Screen name="(search)" />
          <Tabs.Screen name="(create)" />
          <Tabs.Screen name="(video)" />
          <Tabs.Screen name="(account)" />
        </Tabs>
      </View>

      {/* Mobile Tab Bar */}
      <ResponsiveTabBar />
    </View>
  );
}
