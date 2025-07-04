import React from "react";
import { TouchableOpacity } from "react-native";
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
import { View } from "../ui";

const NAVIGATION_ITEMS = [
  { key: "/", label: "Home", icon: Home },
  { key: "/search", label: "Search", icon: Search },
  { key: "/create", label: "New Post", icon: PlusSquare, requiresAuth: true },
  { key: "/video", label: "Video", icon: Video, requiresAuth: true },
  { key: "/profile", label: "Profile", icon: User },
];

export function ResponsiveTabBar() {
  const { isDarkMode } = useSettings();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const handleNavigation = (path: string, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      router.push("/profile");
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
    <View className="tab-bar-mobile">
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
    </View>
  );
}
