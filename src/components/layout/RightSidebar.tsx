import React, { useState } from "react";
import { TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Search, X } from "lucide-react-native";
import { router } from "expo-router";
import { Text, View, HStack, VStack } from "../ui";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useSuggestedFollows } from "@/hooks/query";
import { useFollowProfile } from "@/hooks/mutation";
import { Colors } from "@/constants/colors";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

interface SuggestedUserProps {
  user: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
    description?: string;
  };
  onFollow: (did: string) => void;
  isFollowing: boolean;
  isLoading: boolean;
}

function SuggestedUser({
  user,
  onFollow,
  isFollowing,
  isLoading,
}: SuggestedUserProps) {
  const handleFollow = () => {
    onFollow(user.did);
  };

  const handleUserPress = () => {
    router.push(`/profile/${user.handle}`);
  };

  return (
    <TouchableOpacity
      className="flex-row items-start p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      onPress={handleUserPress}
    >
      <Avatar
        uri={user.avatar}
        size="medium"
        fallbackText={user.displayName || user.handle}
      />

      <VStack darkColor="none" className="flex-1 ml-3">
        <HStack darkColor="none" className="items-center justify-between">
          <VStack darkColor="none" className="flex-1">
            <Text
              font="semiBold"
              size="sm"
              className="text-gray-900 dark:text-white"
            >
              {user.displayName || user.handle}
            </Text>
            <Text size="sm" className="text-gray-500">
              @{user.handle}
            </Text>
          </VStack>

          <Button
            title={isFollowing ? "Following" : "Follow"}
            variant={isFollowing ? "outline" : "primary"}
            size="small"
            onPress={handleFollow}
            disabled={isLoading}
            className="ml-2"
          />
        </HStack>

        {user.description && (
          <Text
            size="sm"
            className="text-gray-600 dark:text-gray-300 mt-1"
            numberOfLines={2}
          >
            {user.description}
          </Text>
        )}
      </VStack>
    </TouchableOpacity>
  );
}

function SearchBox() {
  const [searchQuery, setSearchQuery] = useState("");
  const { colorScheme } = useSettings();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <VStack className="py-2 mt-2 border-gray-200 ">
      <HStack
        className="px-3 py-1 rounded-full items-center"
        style={[{ backgroundColor: Colors.background.secondary[colorScheme] }]}
      >
        <Search size={20} color="#6b7280" />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          className="flex-1 ml-2 py-4 h-5 text-sm dark:text-white"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear} className="ml-2 p-1">
            <X size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
      </HStack>
    </VStack>
  );
}

function SuggestedPeopleSection() {
  const { isAuthenticated } = useAuth();
  const { data: suggestedUsers, isLoading } = useSuggestedFollows();
  const followMutation = useFollowProfile();

  const handleFollow = (did: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    followMutation.mutate({ did });
  };

  const isFollowing = () => {
    // This would need to be implemented based on your following state management
    return false;
  };

  if (isLoading) {
    return (
      <VStack className="p-4">
        <Text
          font="semiBold"
          size="lg"
          className="text-gray-900 dark:text-white mb-4"
        >
          <Trans>Suggested people</Trans>
        </Text>
        <VStack className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <HStack key={index} className="items-center space-x-3">
              <View className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <VStack className="flex-1">
                <View className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                <View className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              </VStack>
              <View className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </HStack>
          ))}
        </VStack>
      </VStack>
    );
  }

  // Handle the case where suggestedUsers might be undefined or not have the expected structure
  const users = suggestedUsers?.actors || [];

  if (users.length === 0) {
    return (
      <VStack className="p-4">
        <Text
          font="semiBold"
          size="lg"
          className="text-gray-900 dark:text-white mb-2"
        >
          <Trans>Suggested people</Trans>
        </Text>
        <Text size="sm" className="text-gray-500">
          {!isAuthenticated
            ? t`Sign in to see personalized suggestions`
            : t`No suggestions available at the moment`}
        </Text>
        {!isAuthenticated && (
          <Button
            title={t`Sign in`}
            variant="primary"
            onPress={() => router.push("/login")}
            className="mt-4"
          />
        )}
      </VStack>
    );
  }

  return (
    <VStack className="p-4  border border-gray-200 dark:border-gray-700 mt-4 rounded-md">
      <HStack className="items-center justify-between mb-4">
        <Text
          font="semiBold"
          size="lg"
          className="text-gray-900 dark:text-white"
        >
          <Trans>Suggested people</Trans>
        </Text>
        <TouchableOpacity onPress={() => router.push("/search/people")}>
          <Text size="sm" className="text-blue-500 hover:text-blue-600">
            <Trans>See all</Trans>
          </Text>
        </TouchableOpacity>
      </HStack>

      <VStack className="space-y-1">
        {users.slice(0, 10).map((user) => (
          <SuggestedUser
            key={user.did}
            user={user}
            onFollow={handleFollow}
            isFollowing={isFollowing()}
            isLoading={followMutation.isPending}
          />
        ))}
        {!isAuthenticated && (
          <VStack className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Text
              size="sm"
              className="text-blue-600 dark:text-blue-400 text-center"
            >
              <Trans>Sign in to follow people and see more suggestions</Trans>
            </Text>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}

export default function RightSidebar() {
  return (
    <View className="flex-1 lg:flex hidden px-4">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <SearchBox />
        <SuggestedPeopleSection />

        {/* Footer */}
        <VStack className="p-4 mt-4">
          <Text size="xs" className="text-gray-500 text-center">
            © 2025 Sky Social
          </Text>
        </VStack>
      </ScrollView>
    </View>
  );
}
