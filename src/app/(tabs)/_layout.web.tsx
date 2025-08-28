import { Tabs } from "expo-router";
import { ResponsiveTabBar } from "@/components/layout/ResponsiveTabBar";
import WebSidebar from "@/components/layout/WebSidebar";
import { View } from "@/components/ui";
import RightSidebar from "@/components/layout/RightSidebar";

export default function TabLayout() {
  return (
    <View darkColor="none" className="flex-1 flex-row bg-white ">
      {/* Desktop Sidebar */}
      <WebSidebar />
      {/* Main Content Area */}
      <View className="flex-1 border-r dark:border-gray-700 border-gray-300">
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
      <RightSidebar />
      {/* Mobile Tab Bar */}
      <ResponsiveTabBar />
    </View>
  );
}
