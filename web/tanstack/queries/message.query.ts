import { useInfiniteQuery } from "@tanstack/react-query";
import { MessageService } from "@/services/message.service";

export const useInfiniteMessages = (conversationId: string | null) => {
    return useInfiniteQuery({
        queryKey: ["messages", conversationId],
        queryFn: async ({ pageParam }) => {
            const res = await MessageService.getMessages(conversationId!, pageParam);
            return res.data;
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => {
            if (lastPage.length < 40) return undefined;
            return lastPage[0]?.id;
        },
        enabled: !!conversationId,
        staleTime: 30_000,
    });
};
