import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { isIOS } from "@/platform";
import { Tabs } from "expo-router";
import {
  Home,
  Search,
  SquarePlus as PlusSquare,
  User,
  Video,
} from "lucide-react-native";

export default function TabLayout() {
  const { isDarkMode, colorScheme } = useSettings();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background.primary[colorScheme],
          paddingTop: isIOS ? 10 : 5,
          borderTopColor: Colors.border[colorScheme],
        },
        tabBarActiveTintColor: isDarkMode
          ? Colors.background.primary.light
          : Colors.background.primary.dark,
        tabBarInactiveTintColor: "#6b7280",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ size, color }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "New Post",
          tabBarIcon: ({ size, color }) => (
            <PlusSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="video"
        options={{
          title: "Video",
          tabBarIcon: ({ size, color }) => <Video size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
