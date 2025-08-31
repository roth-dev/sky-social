import { ATProfile } from "./atproto";

export interface ChatConversation {
  id: string;
  rev: string;
  members: ATProfile[];
  lastMessage?: ChatMessage | DeletedChatMessage;
  muted: boolean;
  status?: "request" | "accepted";
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  rev: string;
  text: string;
  facets?: Array<{
    features: Array<{
      $type: string;
      uri?: string;
      tag?: string;
      did?: string;
    }>;
    index: {
      byteEnd: number;
      byteStart: number;
    };
  }>;
  embed?: {
    $type: string;
    record: {
      uri: string;
      cid: string;
    };
  };
  sentAt: string;
  sender: ChatMessageSender;
}

export interface DeletedChatMessage {
  id: string;
  rev: string;
  sentAt: string;
  sender: ChatMessageSender;
}

export interface ChatMessageSender {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

export interface ChatConversationsResponse {
  convos: ChatConversation[];
  cursor?: string;
}

export interface ChatMessagesResponse {
  messages: (ChatMessage | DeletedChatMessage)[];
  cursor?: string;
}

export interface ChatPaginatedResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Store interfaces
export interface ChatStore {
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  messages: Record<string, (ChatMessage | DeletedChatMessage)[]>;
  isLoading: boolean;
  error: string | null;

  // Actions
  setConversations: (conversations: ChatConversation[]) => void;
  addConversation: (conversation: ChatConversation) => void;
  updateConversation: (
    conversationId: string,
    updates: Partial<ChatConversation>
  ) => void;
  setCurrentConversation: (conversation: ChatConversation | null) => void;
  setMessages: (
    conversationId: string,
    messages: (ChatMessage | DeletedChatMessage)[]
  ) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearStore: () => void;
}

export interface NewConversationParams {
  members: string[];
}

export interface SendMessageParams {
  conversationId: string;
  text: string;
}

export interface ConversationParams {
  conversationId: string;
}

export interface MessagesParams {
  conversationId: string;
  limit?: number;
  cursor?: string;
}
