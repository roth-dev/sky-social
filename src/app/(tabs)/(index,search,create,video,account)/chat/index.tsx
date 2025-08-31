import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { View, Text } from "@/components/ui";
import { ConversationItem } from "@/components/chat/ConversationItem";
import { useConversations } from "@/hooks/query";
import type { ChatConversation } from "@/types/chat";

export default function ChatScreen() {
  const {
    data: conversationsResponse,
    isLoading,
    refetch,
    isRefetching,
  } = useConversations();

  const handleConversationPress = (conversation: ChatConversation) => {
    router.push(`/chat/${conversation.id}`);
  };

  const renderConversation = ({ item }: { item: ChatConversation }) => (
    <ConversationItem
      conversation={item}
      onPress={() => handleConversationPress(item)}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const conversations = conversationsResponse?.convos || [];

  if (conversations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            Messages coming soon!
          </Text>
          <Text className="text-gray-500 text-center">
            Direct messaging is currently being developed by Bluesky. This
            feature will be available once the chat API is fully deployed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </SafeAreaView>
  );
}
