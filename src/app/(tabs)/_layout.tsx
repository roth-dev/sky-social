import TabBar from "@/components/TabBar";
import { useComposeMessage } from "@/contexts/ComposserProvider";
import { Tabs } from "expo-router";
import {
  Home,
  Search,
  SquarePlus as PlusSquare,
  User,
  Video,
} from "lucide-react-native";
export default function TabLayout() {
  const { composeMessage } = useComposeMessage();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: "#6b7280",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="(index)"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(search)"
        options={{
          title: "Search",
          tabBarIcon: ({ size, color }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(create)"
        listeners={() => {
          return {
            tabPress: (e) => {
              e.preventDefault();
              composeMessage();
            },
          };
        }}
        options={{
          title: "Post",
          tabBarIcon: ({ size, color }) => (
            <PlusSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(video)"
        options={{
          title: "Video",
          tabBarIcon: ({ size, color }) => <Video size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(account)"
        options={{
          title: "Account",
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
