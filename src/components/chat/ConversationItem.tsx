import React from "react";
import { View, Text } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";
import { ChatConversation } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import { TouchableOpacity } from "react-native";

interface ConversationItemProps {
  conversation: ChatConversation;
  onPress: () => void;
}

export function ConversationItem({
  conversation,
  onPress,
}: ConversationItemProps) {
  const otherMembers = conversation.members; // In a group chat, we might filter out current user
  const displayName =
    otherMembers.length === 1
      ? otherMembers[0].displayName || otherMembers[0].handle
      : `${otherMembers.length} members`;

  const lastMessageText = conversation.lastMessage
    ? "text" in conversation.lastMessage
      ? conversation.lastMessage.text
      : "Message deleted"
    : "No messages yet";

  const lastMessageTime = conversation.lastMessage?.sentAt
    ? formatDistanceToNow(new Date(conversation.lastMessage.sentAt), {
        addSuffix: true,
      })
    : "";

  return (
    <TouchableOpacity onPress={onPress}>
      <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <View className="relative">
          <Avatar
            size="large"
            uri={otherMembers[0]?.avatar}
            fallbackText={displayName}
          />
          {conversation.unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-blue-500 rounded-full min-w-[20px] h-5 flex items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-base" numberOfLines={1}>
              {displayName}
            </Text>
            {lastMessageTime && (
              <Text className="text-gray-500 text-sm">{lastMessageTime}</Text>
            )}
          </View>

          <View className="flex-row items-center mt-1">
            <Text
              className={`flex-1 ${
                conversation.unreadCount > 0
                  ? "font-medium text-gray-900 dark:text-gray-100"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              numberOfLines={2}
            >
              {lastMessageText}
            </Text>
            {conversation.muted && (
              <View className="ml-2">
                <Text className="text-gray-400 text-sm">🔇</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
