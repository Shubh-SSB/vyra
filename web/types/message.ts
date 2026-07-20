export type Message = {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type?: "TEXT" | "MEDIA";
    createdAt: string;
    updatedAt?: string;
    editedAt?: string | null;
    deletedAt?: string | null;
};
