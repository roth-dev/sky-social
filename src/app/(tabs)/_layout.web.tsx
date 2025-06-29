import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { WebSidebar } from "@/components/layout/WebSidebar";
import SearchScreen from "./search";
import { useAuth } from "@/contexts/AuthContext";

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  return (
    <View style={styles.webContainer}>
      <WebSidebar />
      <View style={styles.webContent}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" }, // Hide tab bar on web
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="search" />
          <Tabs.Screen name="create" />
          <Tabs.Screen name="video" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </View>
      <View style={{ flex: 1 }}>{!isAuthenticated && <SearchScreen />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#ffffff",
  },
  webContent: {
    flex: 1,
    marginLeft: 280, // Width of sidebar
    borderRightWidth: 0.5,
  },
});
