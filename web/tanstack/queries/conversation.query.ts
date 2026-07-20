import { useQuery } from "@tanstack/react-query"
import { ConversationService } from "@/services/conversation.service"

export const useConversations = () => {
    return useQuery({
        queryKey: ["conversations"],
        queryFn: async () => {
            const res = await ConversationService.getConversations();
            return res.data;
        },
    })
}

