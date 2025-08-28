import React, { useState } from "react";
import { TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Search, X } from "lucide-react-native";
import { router } from "expo-router";
import { Text, View, HStack, VStack } from "../ui";
import { Button } from "../ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useSuggestedFollows } from "@/hooks/query";
import { Colors } from "@/constants/colors";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { UserSearchResult } from "../search/UserSearchResult";

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
          className="flex-1 ml-1 py-4 h-8 text-sm dark:text-white focus:outline-none"
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
    <VStack className="py-4  border border-gray-200 dark:border-gray-700 mt-4 rounded-md">
      <HStack className="items-center justify-between m-4">
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

      {users.slice(0, 5).map((user) => (
        <UserSearchResult user={user} key={user.did} />
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
  );
}

export default function RightSidebar() {
  return (
    <View className="px-4 w-[35%] hidden lg:flex">
      <View className="w-96">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-1"
        >
          <SearchBox />
          <SuggestedPeopleSection />

          {/* Footer */}
          <VStack className="p-4 mt-4">
            <Text size="xs" className="text-gray-500 text-center">
              © {new Date().getFullYear()} Sky Social
            </Text>
          </VStack>
        </ScrollView>
      </View>
    </View>
  );
}
