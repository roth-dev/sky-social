import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { useChatStore } from "@/store/chatStore";
import {
  ChatConversationsResponse,
  ChatMessagesResponse,
  SendMessageParams,
  ConversationParams,
  MessagesParams,
  NewConversationParams,
} from "@/types/chat";
import {
  adaptConvoViewToChatConversation,
  adaptMessageViewToChatMessage,
  adaptAnyMessageToChatMessage,
} from "@/utils/chatAdapters";

// Query Keys
export const chatQueryKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatQueryKeys.all, "conversations"] as const,
  conversation: (id: string) =>
    [...chatQueryKeys.all, "conversation", id] as const,
  messages: (conversationId: string) =>
    [...chatQueryKeys.all, "messages", conversationId] as const,
};

// Conversations Query
export const useConversations = () => {
  const { setConversations, setLoading, setError } = useChatStore();

  return useQuery({
    queryKey: chatQueryKeys.conversations(),
    queryFn: async (): Promise<ChatConversationsResponse> => {
      setLoading(true);
      try {
        const response = await atprotoClient.listConversations();
        if (!response.success) {
          throw new Error(response.error || "Failed to fetch conversations");
        }

        const adaptedConversations = (response.data?.convos || []).map(
          adaptConvoViewToChatConversation
        );
        setConversations(adaptedConversations);
        setError(null);
        return { convos: adaptedConversations, cursor: response.data?.cursor };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: atprotoClient.getIsAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Single Conversation Query
export const useConversation = ({ conversationId }: ConversationParams) => {
  const { setCurrentConversation, setError } = useChatStore();

  return useQuery({
    queryKey: chatQueryKeys.conversation(conversationId),
    queryFn: async () => {
      try {
        const response = await atprotoClient.getConversation(conversationId);
        if (!response.success) {
          throw new Error(response.error || "Failed to fetch conversation");
        }

        const adaptedConversation = response.data?.convo
          ? adaptConvoViewToChatConversation(response.data.convo)
          : null;
        setCurrentConversation(adaptedConversation);
        setError(null);
        return { convo: adaptedConversation };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        throw error;
      }
    },
    enabled: atprotoClient.getIsAuthenticated() && !!conversationId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Messages Query
export const useMessages = ({
  conversationId,
  limit = 50,
  cursor,
}: MessagesParams) => {
  const { setMessages, setError } = useChatStore();

  return useQuery({
    queryKey: chatQueryKeys.messages(conversationId),
    queryFn: async (): Promise<ChatMessagesResponse> => {
      try {
        const response = await atprotoClient.getMessages(
          conversationId,
          limit,
          cursor
        );
        if (!response.success) {
          throw new Error(response.error || "Failed to fetch messages");
        }

        const adaptedMessages = (response.data?.messages || []).map(
          adaptAnyMessageToChatMessage
        );
        setMessages(conversationId, adaptedMessages);
        setError(null);
        return { messages: adaptedMessages, cursor: response.data?.cursor };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        throw error;
      }
    },
    enabled: atprotoClient.getIsAuthenticated() && !!conversationId,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for real-time feel
  });
};

// Send Message Mutation
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { addMessage, setError } = useChatStore();

  return useMutation({
    mutationFn: async ({ conversationId, text }: SendMessageParams) => {
      const response = await atprotoClient.sendMessage(conversationId, text);
      if (!response.success) {
        throw new Error(response.error || "Failed to send message");
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Add message to store
      if (data) {
        const adaptedMessage = adaptMessageViewToChatMessage(data);
        addMessage(variables.conversationId, adaptedMessage);
      }

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.messages(variables.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversations(),
      });

      setError(null);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message";
      setError(errorMessage);
    },
  });
};

// Create Conversation Mutation
export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const { addConversation, setCurrentConversation, setError } = useChatStore();

  return useMutation({
    mutationFn: async ({ members }: NewConversationParams) => {
      const response = await atprotoClient.getOrCreateConversation(members);
      if (!response.success) {
        throw new Error(response.error || "Failed to create conversation");
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.convo) {
        const adaptedConversation = adaptConvoViewToChatConversation(
          data.convo
        );
        addConversation(adaptedConversation);
        setCurrentConversation(adaptedConversation);
      }

      // Invalidate conversations query
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversations(),
      });

      setError(null);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create conversation";
      setError(errorMessage);
    },
  });
};

// Mute Conversation Mutation
export const useMuteConversation = () => {
  const queryClient = useQueryClient();
  const { updateConversation, setError } = useChatStore();

  return useMutation({
    mutationFn: async ({ conversationId }: ConversationParams) => {
      const response = await atprotoClient.muteConversation(conversationId);
      if (!response.success) {
        throw new Error(response.error || "Failed to mute conversation");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      updateConversation(variables.conversationId, { muted: true });

      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversations(),
      });

      setError(null);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to mute conversation";
      setError(errorMessage);
    },
  });
};

// Unmute Conversation Mutation
export const useUnmuteConversation = () => {
  const queryClient = useQueryClient();
  const { updateConversation, setError } = useChatStore();

  return useMutation({
    mutationFn: async ({ conversationId }: ConversationParams) => {
      const response = await atprotoClient.unmuteConversation(conversationId);
      if (!response.success) {
        throw new Error(response.error || "Failed to unmute conversation");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      updateConversation(variables.conversationId, { muted: false });

      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversations(),
      });

      setError(null);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to unmute conversation";
      setError(errorMessage);
    },
  });
};

// Delete Message Mutation
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const { removeMessage, setError } = useChatStore();

  return useMutation({
    mutationFn: async ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => {
      const response = await atprotoClient.deleteMessage(
        conversationId,
        messageId
      );
      if (!response.success) {
        throw new Error(response.error || "Failed to delete message");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      removeMessage(variables.conversationId, variables.messageId);

      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.messages(variables.conversationId),
      });

      setError(null);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete message";
      setError(errorMessage);
    },
  });
};
