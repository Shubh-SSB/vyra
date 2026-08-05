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

export type AttachmentType = "VOICE" | "IMAGE" | "VIDEO" | "DOCUMENT";
export type AttachmentStatus = "TEMPORARY" | "ACTIVE" | "DELETED";
export type ProcessingStatus = "READY" | "PROCESSING" | "FAILED";

export type Attachment = {
    id: string;
    type: AttachmentType;
    mimeType: string;
    size: number;
    storageKey: string;
    fileUrl: string;
    status: AttachmentStatus;
    processingStatus: ProcessingStatus;
    metadata?: Record<string, any> | null;
    createdAt: string;
    updatedAt: string;
    messageId?: string | null;
};

export type Message = {
    id: string;
    conversationId: string;
    senderId: string;
    content?: string | null;
    type?: "TEXT" | "VOICE";
    attachments?: Attachment[];
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
        avatarUrl?: string | null;
    };
    replyToId?: string | null;
    replyTo?: Message | null;
    savedIn?: { collectionId: string }[];
    isPinned?: boolean;
    pinnedDuration?: string | null;
    pinnedById?: string | null;
    pinnedBy?: {
        id: string;
        username: string;
        displayName: string;
    } | null;
};
