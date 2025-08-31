import React, { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text } from "@/components/ui";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { useMessages, useConversation } from "@/hooks/query";
import { useChatStore } from "@/store/chatStore";
import type { ChatMessage, DeletedChatMessage } from "@/types/chat";

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [refreshing, setRefreshing] = useState(false);

  const { data: conversationResponse } = useConversation({
    conversationId: conversationId!,
  });
  const {
    data: messagesResponse,
    isLoading,
    refetch,
  } = useMessages({ conversationId: conversationId! });
  const { setCurrentConversation } = useChatStore();

  useEffect(() => {
    if (conversationResponse?.convo) {
      setCurrentConversation(conversationResponse.convo);
      // Update the header title with the conversation participants
      const otherMembers = conversationResponse.convo.members.filter(
        (member) => member.did !== "your-did-here"
      ); // TODO: Get current user's DID
      const title =
        otherMembers.length === 1
          ? otherMembers[0].displayName || otherMembers[0].handle
          : `${otherMembers.length} people`;

      router.setParams({ title });
    }

    return () => {
      setCurrentConversation(null);
    };
  }, [conversationResponse, setCurrentConversation]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const messages = messagesResponse?.messages || [];

  const renderMessage = ({
    item,
  }: {
    item: ChatMessage | DeletedChatMessage;
  }) => {
    return <MessageBubble message={item} />;
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          onRefresh={handleRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexGrow: messages.length === 0 ? 1 : undefined,
          }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500 text-center">
                No messages yet. Start the conversation!
              </Text>
            </View>
          }
        />

        <View className="border-t border-gray-200 px-4 py-2">
          <MessageInput
            conversationId={conversationId!}
            placeholder="Type a message..."
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
