import { Tabs } from "expo-router";
import { View } from "react-native";
import { WebSidebar } from "@/components/layout/WebSidebar";
import { ResponsiveTabBar } from "@/components/layout/ResponsiveTabBar";
import SearchScreen from "./search";
import { useAuth } from "@/contexts/AuthContext";

export default function TabLayout() {
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
          <Tabs.Screen name="profile" />
        </Tabs>
      </View>
      
      {/* Right Panel for Search (when not authenticated) */}
      <View className="hidden lg:flex lg:w-80 lg:border-l lg:border-gray-200">
        {!isAuthenticated && <SearchScreen />}
      </View>
      
      {/* Mobile Tab Bar */}
      <ResponsiveTabBar />
    </View>
  );
}