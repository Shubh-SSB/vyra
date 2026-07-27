import { Message, MessageReaction } from "./message";

export type NewMessagePayload = {
    conversationId: string;
    message: Message;
};

export type TypingPayload = {
    conversationId: string;
    userId: string;
    username?: string;
};

export type UseChatSocketOptions = {
    conversationId?: string | null;
    conversationIds?: string[];
    onNewMessage: (message: Message, conversationId: string) => void;
    onTypingStart?: (payload: TypingPayload) => void;
    onTypingStop?: (payload: TypingPayload) => void;
    onMessagesRead?: (payload: { conversationId: string; userId: string; lastReadAt: string }) => void;
    onUserPresence?: (payload: { userId: string; isOnline: boolean; lastSeen: string | null }) => void;
    onMessageReaction?: (payload: { conversationId: string; messageId: string; reactions: MessageReaction[] }) => void;
    onError?: (message: string) => void;
    onMessageEdited?: (payload: MessageEditPayload) => void;
};

export type MessageEditPayload = {
    conversationId: string;
    message: Pick<Message, "id" | "content" | "editedAt">;
};
