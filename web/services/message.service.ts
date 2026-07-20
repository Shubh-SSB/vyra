import { $crud } from "@/factory/crudFactory";
import { Message } from "@/types/message";

export const MessageService = {
    getMessages(conversationId: string) {
        return $crud.get<Message[]>(`messages/${conversationId}`);
    },
};
