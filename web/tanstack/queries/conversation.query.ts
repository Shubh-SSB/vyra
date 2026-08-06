import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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

export const useDeleteConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await ConversationService.deleteConversation(id);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
};

export const useClearConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await ConversationService.clearConversation(id);
            return res.data;
        },
        onSuccess: (_, conversationId) => {
            queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
};

