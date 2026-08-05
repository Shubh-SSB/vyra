import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationService } from "@/services/notification.service";

export const useNotifications = (page = 1, limit = 20) => {
    return useQuery({
        queryKey: ["notifications", page, limit],
        queryFn: async () => {
            const res = await NotificationService.getNotifications(page, limit);
            return res.data;
        },
        staleTime: 10_000,
    });
};

export const useUnreadCount = () => {
    return useQuery({
        queryKey: ["notifications", "unread-count"],
        queryFn: async () => {
            const res = await NotificationService.getUnreadCount();
            return res.data.count;
        },
        staleTime: 10_000,
    });
};

export const useNotificationsMutations = () => {
    const queryClient = useQueryClient();

    const markAsRead = useMutation({
        mutationFn: async (id: string) => {
            const res = await NotificationService.markAsRead(id);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const markAllAsRead = useMutation({
        mutationFn: async () => {
            const res = await NotificationService.markAllAsRead();
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const deleteNotification = useMutation({
        mutationFn: async (id: string) => {
            const res = await NotificationService.deleteNotification(id);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const deleteAllNotifications = useMutation({
        mutationFn: async () => {
            const res = await NotificationService.deleteAllNotifications();
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    return {
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
    };
};
