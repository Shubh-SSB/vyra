import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConversationService } from "@/services/conversation.service";
import { ConversationPreview } from "@/types/conversation";
import { getMyUserId } from "@/lib/token";

export const useConversations = () => {
    return useQuery({
        queryKey: ["conversations"],
        queryFn: async () => {
            const res = await ConversationService.getConversations();
            return res.data;
        },
    });
};

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

export const useTogglePinConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await ConversationService.togglePinConversation(id);
            return res.data;
        },
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: ["conversations"] });
            const previousConversations = queryClient.getQueryData<ConversationPreview[]>(["conversations"]);
            const myId = getMyUserId();

            if (previousConversations) {
                queryClient.setQueryData<ConversationPreview[]>(["conversations"], (old) => {
                    if (!old) return [];
                    return old.map((conv) => {
                        if (conv.id === id) {
                            const currentPinned = Boolean(
                                conv.isPinned ||
                                (myId && conv.participants?.some((p) => p.userId === myId && p.isPinned))
                            );
                            const newPinned = !currentPinned;
                            return {
                                ...conv,
                                isPinned: newPinned,
                                pinnedAt: newPinned ? new Date().toISOString() : null,
                                participants: conv.participants.map((p) => {
                                    if (myId && p.userId === myId) {
                                        return { ...p, isPinned: newPinned, pinnedAt: newPinned ? new Date().toISOString() : null };
                                    }
                                    return p;
                                }),
                            };
                        }
                        return conv;
                    });
                });
            }
            return { previousConversations };
        },
        onSuccess: (data) => {
            if (data?.conversationId) {
                const myId = getMyUserId();
                queryClient.setQueryData<ConversationPreview[]>(["conversations"], (old) => {
                    if (!old) return [];
                    return old.map((conv) => {
                        if (conv.id === data.conversationId) {
                            return {
                                ...conv,
                                isPinned: data.isPinned,
                                pinnedAt: data.pinnedAt,
                                participants: conv.participants.map((p) => {
                                    if (myId && p.userId === myId) {
                                        return { ...p, isPinned: data.isPinned, pinnedAt: data.pinnedAt };
                                    }
                                    return p;
                                }),
                            };
                        }
                        return conv;
                    });
                });
            }
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
        onError: (_err, _id, context) => {
            if (context?.previousConversations) {
                queryClient.setQueryData(["conversations"], context.previousConversations);
            }
        },
    });
};
