import { ConversationPreview } from "@/types/conversation";
import { $crud } from "@/factory/crudFactory";

export const ConversationService = {
    getConversations() {
        return $crud.get<ConversationPreview[]>("conversations");
    },

    createDirectConversation(userId: string) {
        return $crud.post<ConversationPreview>("conversations/direct", { userId });
    },

    deleteConversation(id: string) {
        return $crud.delete<{ success: boolean }>(`conversations/${id}`);
    },

    clearConversation(id: string) {
        return $crud.delete<{ success: boolean }>(`conversations/${id}/messages`);
    },

    pinConversation(id: string) {
        return $crud.post<{ conversationId: string; isPinned: boolean }>(`conversations/${id}/pin`, {});
    },

    unpinConversation(id: string) {
        return $crud.delete<{ conversationId: string; isPinned: boolean }>(`conversations/${id}/pin`);
    },

    togglePinConversation(id: string) {
        return $crud.post<{ conversationId: string; isPinned: boolean; pinnedAt: string | null }>(`conversations/${id}/toggle-pin`, {});
    },
};
