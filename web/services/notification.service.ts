import { $crud } from "@/factory/crudFactory";

export type NotificationType =
    | "NEW_MESSAGE"
    | "FRIEND_REQUEST"
    | "MESSAGE_REACTION"
    | "MESSAGE_PIN"
    | "AI_REMEMBER"
    | "SCHEDULED_MESSAGE"
    | "MISSED_CALL"
    | "GROUP_MENTION";

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: any;
    isRead: boolean;
    groupId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedNotifications {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export const NotificationService = {
    getNotifications(page: number = 1, limit: number = 20) {
        return $crud.get<PaginatedNotifications>(`notifications?page=${page}&limit=${limit}`);
    },

    getUnreadCount() {
        return $crud.get<{ count: number }>(`notifications/unread-count`);
    },

    markAsRead(id: string) {
        return $crud.patch<Notification>(`notifications/${id}/read`, {});
    },

    markAllAsRead() {
        return $crud.patch<{ count: number }>(`notifications/read-all`, {});
    },

    clearConversationNotifications(conversationId: string) {
        return $crud.patch<{ success: boolean }>(`notifications/clear-conversation/${conversationId}`, {});
    },

    deleteNotification(id: string) {
        return $crud.delete<{ success: boolean }>(`notifications/${id}`);
    },

    deleteAllNotifications() {
        return $crud.delete<{ success: boolean }>(`notifications`);
    },
};
