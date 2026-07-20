import { useQuery } from "@tanstack/react-query";
import { MessageService } from "@/services/message.service";

export const useMessages = (conversationId: string | null) => {
    return useQuery({
        queryKey: ["messages", conversationId],
        queryFn: async () => {
            const res = await MessageService.getMessages(conversationId!);
            return res.data;
        },
        enabled: !!conversationId,
        staleTime: 30_000,
    });
};
