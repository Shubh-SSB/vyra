export type MessageReaction = {
    messageId: string;
    userId: string;
    reaction: "LIKE" | "LOVE" | "ANGRY" | "SAD" | "WOW" | "LAUGH" | "CUSTOM";
    customEmoji?: string | null;
    createdAt: string;
    user: {
        id: string;
        username: string;
        displayName: string;
    };
};

export type Message = {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type?: "TEXT" | "MEDIA";
    reactions?: MessageReaction[];
    createdAt: string;
    updatedAt?: string;
    editedAt?: string | null;
    deletedAt?: string | null;
    isForwarded?: boolean;
    forwardedFromId?: string | null;
    sender?: {
        id: string;
        username: string;
        displayName: string;
    };
    replyToId?: string | null;
    replyTo?: Message | null;
    savedIn?: { collectionId: string }[];
};

