import { $crud } from "@/factory/crudFactory";
import { Message } from "@/types/message";

export const MessageService = {
    getMessages(conversationId: string, cursor?: string, limit: number = 40) {
        let url = `messages/${conversationId}?limit=${limit}`;
        if (cursor) {
            url += `&cursor=${cursor}`;
        }
        return $crud.get<Message[]>(url);
    },

    editMessage(messageId: string, content: string) {
        return $crud.patch<Message>(`messages/${messageId}`, { content });
    },

    deleteForMe(messageId: string) {
        return $crud.delete<{ messageId: string; deleteType: string }>(`messages/${messageId}/me`);
    },

    deleteForEveryone(messageId: string) {
        return $crud.delete<{ messageId: string; deleteType: string }>(`messages/${messageId}/everyone`);
    },

    hideMessage(messageId: string) {
        return $crud.post<{ messageId: string; hidden: boolean }>(`messages/${messageId}/hide`, {});
    },

    getHiddenMessages() {
        return $crud.get<Message[]>(`messages/hidden`);
    },

    unhideMessage(messageId: string) {
        return $crud.delete<{ messageId: string; hidden: false }>(`messages/${messageId}/hide`);
    },
};
