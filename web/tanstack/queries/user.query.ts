import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { UserService } from "@/services/user.service"
import { queryKeys } from "../query-keys"

export const useSearchUsers = (query: string) => {
    return useQuery({
        queryKey: ["users", "search", query],
        queryFn: async () => {
            const res = await UserService.search(query)
            return res.data;
        },
        enabled: query.trim().length >= 2,
    })
}

export const useProfile = (username: string) => {
    return useQuery({
        queryKey: ["users", "profile", username],
        queryFn: async () => {
            const res = await UserService.getProfile(username);
            return res.data;
        },
    })
}

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { displayName?: string; bio?: string; avatarUrl?: string; email?: string }) => {
            const res = await UserService.updateProfile(data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.me });
        },
    });
};

export const useUpdateUsername = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { username: string }) => {
            const res = await UserService.updateUsername(data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.me });
        },
    });
};

export const useUpdatePrivacy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            profileVisibility?: string;
            messagePrivacy?: string;
            presenceVisibility?: string;
            showLastSeen?: boolean;
            showReadReceipts?: boolean;
        }) => {
            const res = await UserService.updatePrivacy(data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.me });
        },
    });
};