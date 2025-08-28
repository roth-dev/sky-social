import React from "react";
import { TouchableOpacity } from "react-native";
import { router, usePathname } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import {
  Home,
  Search,
  User,
  LogOut,
  Settings,
  Video,
} from "lucide-react-native";
import { Text, View } from "../ui";
import { cn } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";

export default function WebSidebar() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  const NAVIGATION_ITEMS = [
    { key: "/", label: t`Home`, icon: Home },
    { key: "/search", label: t`Discover`, icon: Search },
    // { key: "/create", label: t`New Post`, icon: PlusSquare, requiresAuth: true },
    {
      key: "/video",
      label: t`Video`,
      icon: Video,
    },
    { key: "/account", label: t`Profile`, icon: User, requiresAuth: true },
    { key: "/setting", label: t`Settings`, icon: Settings },
  ];
  const handleNavigation = (path: string, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      router.push("/account");
      return;
    }
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const isActivePath = (path: string) => {
    if (path === "/") {
      return pathname === "/" || pathname === "/index";
    }
    return pathname.includes(path);
  };
  return (
    <View className="p-5 w-[29%] border-r dark:border-gray-700 border-gray-300 items-end md:flex hidden">
      <View className="lg:w-72 flex-1">
        {/* User Section */}
        {isAuthenticated && user && (
          <View className="py-5">
            <View className="flex-row items-center gap-3" darkColor="none">
              <TouchableOpacity
                className="flex-1 flex-row items-center gap-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onPress={() => router.push("/account")}
              >
                <Avatar
                  uri={user.avatar}
                  size="medium"
                  fallbackText={user.displayName || user.handle}
                />
                <View className="flex-1" darkColor="none">
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

              <TouchableOpacity
                className="p-2 rounded-lg"
                onPress={handleLogout}
              >
                <LogOut size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
        )}

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
                className={cn(
                  "flex-row items-center py-3 px-4 rounded-full gap-4 dark:hover:bg-gray-800 hover:bg-gray-100",
                  isActive && "bg-blue-50 dark:bg-[#1f2937]"
                )}
                onPress={() => handleNavigation(item.key, item.requiresAuth)}
              >
                <IconComponent
                  size={24}
                  color={isActive ? "#1d4ed8" : "#6b7280"}
                />
                <Text
                  size="lg"
                  font="semiBold"
                  className={cn(
                    isActive ? "text-blue-700" : "dark:text-white text-gray-600"
                  )}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View className="pt-4 items-center">
          <Text className="text-xs text-gray-400">
            <Trans>Powered by AT Protocol</Trans>
          </Text>
        </View>
      </View>
    </View>
  );
}
