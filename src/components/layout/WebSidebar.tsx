import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { router, usePathname } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Chrome as Home,
  Search,
  SquarePlus as PlusSquare,
  User,
  LogOut,
  Heart,
  Settings,
} from "lucide-react-native";

const NAVIGATION_ITEMS = [
  { key: "/", label: "Home", icon: Home },
  { key: "/search", label: "Search", icon: Search },
  { key: "/create", label: "New Post", icon: PlusSquare, requiresAuth: true },
  {
    key: "/video",
    label: "Video",
    icon: Heart,
    requiresAuth: true,
  },
  { key: "/profile", label: "Profile", icon: User },
  { key: "/settings", label: "Settings", icon: Settings },
];

export default function WebSidebar() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  const handleNavigation = (path: string, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      router.push("/profile");
      return;
    }
    router.push(path);
  };

  const handleLogin = () => {
    router.push("/profile");
  };

  const handleLogout = () => {
    logout();
  };

  const isActivePath = (path: string) => {
    if (path === "/") {
      return pathname === "/" || pathname === "/index";
    }
    return pathname.startsWith(path);
  };

  return (
    <View className="sidebar-desktop p-5 justify-between">
      {/* Logo/Brand */}
      <View className="py-4 px-2 mb-5">
        <Text className="text-2xl font-bold text-blue-600">Sky Social</Text>
      </View>

      {/* Navigation */}
      <View className="flex-1 space-y-1">
        {NAVIGATION_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = isActivePath(item.key);
          const shouldShow = !item.requiresAuth || isAuthenticated;

          if (!shouldShow && item.requiresAuth) return null;

          return (
            <TouchableOpacity
              key={item.key}
              className={`flex-row items-center py-3 px-4 rounded-full gap-4 ${
                isActive ? "bg-blue-50" : ""
              }`}
              onPress={() => handleNavigation(item.key, item.requiresAuth)}
            >
              <IconComponent
                size={24}
                color={isActive ? "#1d4ed8" : "#6b7280"}
              />
              <Text
                className={`text-lg font-medium ${
                  isActive ? "text-blue-700 font-semibold" : "text-gray-600"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* User Section */}
      <View className="pt-5 border-t border-gray-200">
        {isAuthenticated && user ? (
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="flex-1 flex-row items-center gap-3 p-2 rounded-xl"
              onPress={() => router.push("/profile")}
            >
              <Avatar
                uri={user.avatar}
                size="medium"
                fallbackText={user.displayName || user.handle}
              />
              <View className="flex-1">
                <Text
                  className="text-base font-semibold text-gray-900"
                  numberOfLines={1}
                >
                  {user.displayName || user.handle}
                </Text>
                <Text className="text-sm text-gray-500" numberOfLines={1}>
                  @{user.handle}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="p-2 rounded-lg" onPress={handleLogout}>
              <LogOut size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-3">
            <Text className="text-base text-gray-700 text-center">
              Join the conversation
            </Text>
            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              size="medium"
              className="w-full"
            />
          </View>
        )}
      </View>

      {/* Footer */}
      <View className="pt-4 items-center">
        <Text className="text-xs text-gray-400">Powered by AT Protocol</Text>
      </View>
    </View>
  );
}