import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { router, usePathname } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  Chrome as Home,
  Search,
  SquarePlus as PlusSquare,
  User,
  Heart,
  Settings,
} from "lucide-react-native";

const NAVIGATION_ITEMS = [
  { key: "/", label: "Home", icon: Home },
  { key: "/search", label: "Search", icon: Search },
  { key: "/create", label: "New Post", icon: PlusSquare, requiresAuth: true },
  { key: "/video", label: "Video", icon: Heart, requiresAuth: true },
  { key: "/profile", label: "Profile", icon: User },
  { key: "/settings", label: "Settings", icon: Settings },
];

export function ResponsiveTabBar() {
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
            <IconComponent size={24} color={isActive ? "#111827" : "#6b7280"} />
            <Text
              className={`text-xs mt-1 ${
                isActive ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}