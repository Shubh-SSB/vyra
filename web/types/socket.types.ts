import { Message } from "./message";

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
    onError?: (message: string) => void;
};