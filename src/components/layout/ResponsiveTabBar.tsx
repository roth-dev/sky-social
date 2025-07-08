import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { router, usePathname } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Search,
  SquarePlus as PlusSquare,
  User,
  Video,
} from "lucide-react-native";
import { useSettings } from "@/contexts/SettingsContext";
import { Colors } from "@/constants/colors";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import useScrollDirection from "@/hooks/useScrollDirection";

const NAVIGATION_ITEMS = [
  { key: "/", label: "Home", icon: Home },
  { key: "/search", label: "Search", icon: Search },
  { key: "/create", label: "New Post", icon: PlusSquare, requiresAuth: true },
  { key: "/video", label: "Video", icon: Video },
  { key: "/account", label: "Account", icon: User, requiresAuth: true },
];

export function ResponsiveTabBar() {
  const { colorScheme, isDarkMode } = useSettings();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const direction = useScrollDirection();

  const translateY = useDerivedValue(() => {
    return withTiming(direction.value === "down" ? 100 : 0, {
      duration: 150,
    });
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: withTiming(direction.value === "down" ? 0 : 1, {
        duration: 150,
      }),
    };
  });

  const handleNavigation = (path: string, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      router.push("/account");
      return;
    }
    router.push(path);
  };

  const isActivePath = (path: string) => {
    if (path === "/") {
      return pathname === "/" || pathname === "/index";
    }
    return pathname.startsWith(path);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: Colors.background.primary[colorScheme] },
        animatedStyle,
      ]}
      className="tab-bar-mobile"
    >
      {NAVIGATION_ITEMS.map((item) => {
        const IconComponent = item.icon;
        const isActive = isActivePath(item.key);
        const shouldShow = !item.requiresAuth || isAuthenticated;

        if (!shouldShow) return null;

        return (
          <TouchableOpacity
            key={item.key}
            className="flex-1 items-center justify-center py-2"
            onPress={() => handleNavigation(item.key, item.requiresAuth)}
          >
            <IconComponent
              size={24}
              color={
                isActive
                  ? isDarkMode
                    ? Colors.background.primary.light
                    : Colors.background.primary.dark
                  : "#6b7280"
              }
            />
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    bottom: 0,
    zIndex: 10,
  },
});
