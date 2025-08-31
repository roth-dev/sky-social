import type { ChatBskyConvoDefs, ChatBskyActorDefs } from "@atproto/api";
import { ATProfile } from "@/types/atproto";
import {
  ChatConversation,
  ChatMessage,
  DeletedChatMessage,
  ChatMessageSender,
} from "@/types/chat";

// Adapter function to convert ProfileViewBasic to ATProfile
export function adaptProfileViewBasicToATProfile(
  profile: ChatBskyActorDefs.ProfileViewBasic
): ATProfile {
  return {
    did: profile.did,
    handle: profile.handle,
    displayName: profile.displayName,
    avatar: profile.avatar,
    labels: profile.labels?.map((label) => ({
      src: label.src,
      uri: label.uri || "",
      cid: label.cid || "",
      val: label.val,
      cts: label.cts || new Date().toISOString(),
    })),
    viewer: profile.viewer,
  };
}

// Adapter function to convert MessageViewSender to ChatMessageSender
export function adaptMessageViewSenderToChatMessageSender(
  sender: ChatBskyConvoDefs.MessageViewSender
): ChatMessageSender {
  return {
    did: sender.did,
    handle: "",
    displayName: undefined,
    avatar: undefined,
  };
}

// Adapter function to convert MessageView to ChatMessage
export function adaptMessageViewToChatMessage(
  message: ChatBskyConvoDefs.MessageView
): ChatMessage {
  return {
    id: message.id,
    rev: message.rev,
    text: message.text,
    facets: message.facets,
    embed: message.embed
      ? {
          $type: message.embed.$type,
          record: {
            uri: "",
            cid: "",
          },
        }
      : undefined,
    sentAt: message.sentAt,
    sender: adaptMessageViewSenderToChatMessageSender(message.sender),
  };
}

// Adapter function to convert DeletedMessageView to DeletedChatMessage
export function adaptDeletedMessageViewToDeletedChatMessage(
  message: ChatBskyConvoDefs.DeletedMessageView
): DeletedChatMessage {
  return {
    id: message.id,
    rev: message.rev,
    sentAt: message.sentAt,
    sender: adaptMessageViewSenderToChatMessageSender(message.sender),
  };
}

// Adapter function to convert any message to ChatMessage or DeletedChatMessage
export function adaptAnyMessageToChatMessage(
  message:
    | ChatBskyConvoDefs.MessageView
    | ChatBskyConvoDefs.DeletedMessageView
    | { $type: string }
): ChatMessage | DeletedChatMessage {
  if (
    "$type" in message &&
    message.$type === "chat.bsky.convo.defs#deletedMessageView"
  ) {
    return adaptDeletedMessageViewToDeletedChatMessage(
      message as ChatBskyConvoDefs.DeletedMessageView
    );
  }
  return adaptMessageViewToChatMessage(
    message as ChatBskyConvoDefs.MessageView
  );
}

// Adapter function to convert ConvoView to ChatConversation
export function adaptConvoViewToChatConversation(
  convo: ChatBskyConvoDefs.ConvoView
): ChatConversation {
  return {
    id: convo.id,
    rev: convo.rev,
    members: convo.members.map(adaptProfileViewBasicToATProfile),
    lastMessage: convo.lastMessage
      ? adaptAnyMessageToChatMessage(convo.lastMessage)
      : undefined,
    muted: convo.muted,
    status:
      convo.status === "request" || convo.status === "accepted"
        ? (convo.status as "request" | "accepted")
        : undefined,
    unreadCount: convo.unreadCount,
  };
}
