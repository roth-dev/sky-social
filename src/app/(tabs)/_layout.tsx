import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import useScrollDirection from "@/hooks/useScrollDirection";
import { isIOS } from "@/platform";
import { Tabs, useSegments } from "expo-router";
import {
  Home,
  Search,
  SquarePlus as PlusSquare,
  User,
  Video,
} from "lucide-react-native";
import { useMemo } from "react";
import { Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

function TabBarBackground({
  isVideoTab,
  isHomeTab,
}: {
  isHomeTab: boolean;
  isVideoTab: boolean;
}) {
  const { colorScheme } = useSettings();
  const direction = useScrollDirection();
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(direction.value === "down" && isHomeTab ? 0.2 : 1, {
      duration: 100,
    }),
  }));

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          backgroundColor: isVideoTab
            ? Colors.black
            : Colors.background.primary[colorScheme],
        },
        animatedStyle,
      ]}
    />
  );
}

export default function TabLayout() {
  const segment = useSegments();

  const { colorScheme } = useSettings();

  const [isHomeTab, isVideoTab] = useMemo(() => {
    const home = segment.length === 1 && segment[0] === "(tabs)";
    const video = segment.length === 2 && segment[1] === "video";
    return [home, video];
  }, [segment]);

  return (
    <Tabs
      screenOptions={{
        tabBarBackground: () => (
          <TabBarBackground isHomeTab={isHomeTab} isVideoTab={isVideoTab} />
        ),
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          paddingTop: isIOS ? 10 : 5,
          borderTopColor: Colors.border[colorScheme],
          position: "absolute",
        },
        tabBarActiveTintColor: isVideoTab
          ? Colors.inverted.dark
          : Colors.inverted[colorScheme],

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
