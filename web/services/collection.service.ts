import { $crud } from "@/factory/crudFactory";
import { Message } from "@/types/message";

export interface Collection {
    id: string;
    name: string;
    emoji: string | null;
    userId: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        items: number;
    };
}

export interface CollectionItem {
    collectionId: string;
    messageId: string;
    savedAt: string;
    message: Message;
}

export const CollectionService = {
    getCollections() {
        return $crud.get<Collection[]>("collections");
    },

    createCollection(name: string, emoji?: string) {
        return $crud.post<Collection>("collections", { name, emoji });
    },

    deleteCollection(id: string) {
        return $crud.delete<null>(`collections/${id}`);
    },

    getCollectionItems(id: string) {
        return $crud.get<CollectionItem[]>(`collections/${id}/items`);
    },

    saveToCollection(collectionId: string, messageId: string) {
        return $crud.post<{ collectionId: string; messageId: string }>(`collections/${collectionId}/items`, { messageId });
    },

    unsaveFromCollection(collectionId: string, messageId: string) {
        return $crud.delete<null>(`collections/${collectionId}/items/${messageId}`);
    },

    transferItem(fromCollectionId: string, messageId: string, targetCollectionId: string, action: "move" | "copy") {
        return $crud.patch<null>(`collections/${fromCollectionId}/items/${messageId}`, { targetCollectionId, action });
    },

    getMessageSavedStatus(messageId: string) {
        return $crud.get<string[]>(`collections/message/${messageId}/status`);
    }
};
