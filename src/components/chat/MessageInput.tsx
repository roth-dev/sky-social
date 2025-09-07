import React, { useState } from "react";
import { View, Dialog } from "@/components/ui";
import { TextInput, TouchableOpacity } from "react-native";
import { Send } from "lucide-react-native";
import { useSendMessage } from "@/hooks/query";

interface MessageInputProps {
  conversationId: string;
  placeholder?: string;
}

export function MessageInput({
  conversationId,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const sendMessageMutation = useSendMessage();

  const handleSend = async () => {
    if (!message.trim()) return;

    const messageToSend = message.trim();
    setMessage(""); // Clear input immediately for better UX

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        text: messageToSend,
      });
    } catch {
      // Restore message on error
      setMessage(messageToSend);
      Dialog.show("Error", "Failed to send message. Please try again.");
    }
  };

  return (
    <View className="flex-row items-end p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <View className="flex-1 mr-3">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={1000}
          style={{
            maxHeight: 100,
            minHeight: 40,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#D1D5DB",
            backgroundColor: "#F9FAFB",
            fontSize: 16,
            color: "#111827",
          }}
          className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        />
      </View>

      <TouchableOpacity
        onPress={handleSend}
        disabled={!message.trim() || sendMessageMutation.isPending}
        className={`w-12 h-12 rounded-full items-center justify-center ${
          message.trim() && !sendMessageMutation.isPending
            ? "bg-blue-500"
            : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <Send
          size={20}
          color={
            message.trim() && !sendMessageMutation.isPending
              ? "white"
              : "#9CA3AF"
          }
        />
      </TouchableOpacity>
    </View>
  );
}
