import { ConversationPreview } from "@/types/conversation";
import { $crud } from "@/factory/crudFactory";

export const ConversationService = {
    getConversations() {
        return $crud.get<ConversationPreview[]>("conversations");
    },

    createDirectConversation(userId: string) {
        return $crud.post<ConversationPreview>("conversations/direct", { userId });
    },
};
