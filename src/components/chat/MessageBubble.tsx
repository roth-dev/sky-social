import React from "react";
import { View, Text } from "@/components/ui";
import { ChatMessage, DeletedChatMessage } from "@/types/chat";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { TouchableOpacity } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { atprotoClient } from "@/lib/atproto";

interface MessageBubbleProps {
  message: ChatMessage | DeletedChatMessage;
  onLongPress?: () => void;
}

export function MessageBubble({ message, onLongPress }: MessageBubbleProps) {
  const { user } = useAuth();
  const currentSession = atprotoClient.getCurrentSession();
  const isOwnMessage =
    message.sender.did === (user?.did || currentSession?.did);
  const isDeleted = !("text" in message);

  const messageTime = dayjs(message.sentAt).fromNow();

  if (isDeleted) {
    return (
      <View
        className={`mb-4 max-w-[80%] ${
          isOwnMessage ? "self-end" : "self-start"
        }`}
      >
        <View
          className={`p-3 rounded-2xl ${
            isOwnMessage
              ? "bg-gray-300 dark:bg-gray-600"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <Text className="text-gray-500 dark:text-gray-400 italic">
            Message deleted
          </Text>
        </View>
        <Text
          className={`text-xs text-gray-500 mt-1 ${
            isOwnMessage ? "text-right" : "text-left"
          }`}
        >
          {messageTime}
        </Text>
      </View>
    );
  }

  const chatMessage = message as ChatMessage;

  return (
    <TouchableOpacity onLongPress={onLongPress} activeOpacity={0.8}>
      <View
        className={`mb-4 max-w-[80%] ${
          isOwnMessage ? "self-end" : "self-start"
        }`}
      >
        <View
          className={`p-3 rounded-2xl ${
            isOwnMessage ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <Text
            className={`${
              isOwnMessage ? "text-white" : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {chatMessage.text}
          </Text>
        </View>
        <Text
          className={`text-xs text-gray-500 mt-1 ${
            isOwnMessage ? "text-right" : "text-left"
          }`}
        >
          {messageTime}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
