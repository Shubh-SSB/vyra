import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FriendService } from "@/services/friend.service";

// ── Queries ──────────────────────────────────────────────────────────────────

export const useRelationship = (userId: string | undefined) => {
    return useQuery({
        queryKey: ["friends", "relationship", userId],
        queryFn: async () => {
            const res = await FriendService.getRelationship(userId!);
            return res.data.relationship;
        },
        enabled: !!userId,
    });
};

export const useIncomingRequests = () => {
    return useQuery({
        queryKey: ["friends", "requests", "incoming"],
        queryFn: async () => {
            const res = await FriendService.getIncomingRequests();
            return res.data;
        },
    });
};

export const useOutgoingRequests = () => {
    return useQuery({
        queryKey: ["friends", "requests", "outgoing"],
        queryFn: async () => {
            const res = await FriendService.getOutgoingRequests();
            return res.data;
        },
    });
};

export const useFriends = () => {
    return useQuery({
        queryKey: ["friends"],
        queryFn: async () => {
            const res = await FriendService.getFriends();
            return res.data;
        },
    });
};

// ── Mutations ────────────────────────────────────────────────────────────────

export const useSendFriendRequest = (targetUserId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => FriendService.sendRequest(targetUserId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["friends", "relationship", targetUserId] });
            qc.invalidateQueries({ queryKey: ["friends", "requests", "outgoing"] });
        },
    });
};

export const useAcceptFriendRequest = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (requestId: string) => FriendService.acceptRequest(requestId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["friends"] });
            qc.invalidateQueries({ queryKey: ["friends", "requests", "incoming"] });
        },
    });
};

export const useRejectFriendRequest = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (requestId: string) => FriendService.rejectRequest(requestId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["friends", "requests", "incoming"] });
        },
    });
};

export const useCancelFriendRequest = (requestId: string | undefined) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => FriendService.cancelRequest(requestId!),
        onSuccess: (_, __, ctx) => {
            qc.invalidateQueries({ queryKey: ["friends", "relationship"] });
            qc.invalidateQueries({ queryKey: ["friends", "requests", "outgoing"] });
        },
    });
};
