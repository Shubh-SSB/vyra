export type ConversationParticipant = {
    conversationId: string;
    userId: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    joinedAt: string;
    user: {
        id: string;
        username: string;
        displayName: string;
        avatarUrl?: string;
        isOnline?: boolean;
        email?: string;
    };
};

export type ConversationMessage = {
    id: string;
    conversationId: string;
    senderId: string;
    type: "TEXT" | "MEDIA";
    content: string;
    createdAt: string;
    updatedAt: string;
    editedAt?: string | null;
    deletedAt?: string | null;
};

export type ConversationPreview = {
    id: string;
    type: "DIRECT" | "GROUP" | "CHANNEL";
    createdAt: string;
    updatedAt: string;
    lastMessageAt?: string;
    participants: ConversationParticipant[];
    messages: ConversationMessage[]; // array, last item is newest
    unreadCount?: number;
};
