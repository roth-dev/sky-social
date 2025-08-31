import { create } from "zustand";
import { ChatStore, ChatMessage, DeletedChatMessage } from "@/types/chat";

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  currentConversation: null,
  messages: {},
  isLoading: false,
  error: null,

  setConversations: (conversations) => set({ conversations, error: null }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      error: null,
    })),

  updateConversation: (conversationId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, ...updates } : conv
      ),
      currentConversation:
        state.currentConversation?.id === conversationId
          ? { ...state.currentConversation, ...updates }
          : state.currentConversation,
      error: null,
    })),

  setCurrentConversation: (conversation) =>
    set({ currentConversation: conversation, error: null }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
      error: null,
    })),

  addMessage: (conversationId, message) =>
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];

      // Check if message already exists
      const messageExists = existingMessages.some(
        (msg) => msg.id === message.id
      );
      if (messageExists) {
        return state;
      }

      const newMessages = [...existingMessages, message];

      // Update the conversation's last message and unread count
      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: message,
            unreadCount: conv.unreadCount + 1,
          };
        }
        return conv;
      });

      return {
        messages: {
          ...state.messages,
          [conversationId]: newMessages,
        },
        conversations: updatedConversations,
        currentConversation:
          state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                lastMessage: message,
                unreadCount: state.currentConversation.unreadCount + 1,
              }
            : state.currentConversation,
        error: null,
      };
    }),

  removeMessage: (conversationId, messageId) =>
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];
      const filteredMessages = existingMessages.filter(
        (msg) => msg.id !== messageId
      );

      return {
        messages: {
          ...state.messages,
          [conversationId]: filteredMessages,
        },
        error: null,
      };
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearStore: () =>
    set({
      conversations: [],
      currentConversation: null,
      messages: {},
      isLoading: false,
      error: null,
    }),
}));

// Helper function to get messages for a conversation
export const useConversationMessages = (
  conversationId: string
): (ChatMessage | DeletedChatMessage)[] => {
  return useChatStore((state) => state.messages[conversationId] || []);
};

// Helper function to get unread count for all conversations
export const useTotalUnreadCount = (): number => {
  return useChatStore((state) =>
    state.conversations.reduce((total, conv) => total + conv.unreadCount, 0)
  );
};
