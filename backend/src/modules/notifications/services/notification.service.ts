import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { NotificationType, Notification } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { ChatGateway } from "../../../socket/gateways/chat.gateway";
import { WebPushService } from "./web-push.service";

@Injectable()
export class NotificationService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => ChatGateway))
        private readonly chatGateway: ChatGateway,
        private readonly webPushService: WebPushService,
    ) {}

    async createNotification(
        userId: string,
        type: NotificationType,
        title: string,
        body: string,
        data?: any,
        groupId?: string,
    ): Promise<Notification> {
        // Create in DB
        const notification = await this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                body,
                data: data || undefined,
                groupId: groupId || null,
            },
        });

        // Broadcast to user socket
        this.chatGateway.broadcastToUser(userId, "newNotification", notification);

        // Send background web push notification
        this.webPushService.sendPushNotification(
            userId,
            title,
            body,
            {
                id: notification.id,
                type,
                groupId,
                ...data,
            }
        ).catch((err) => {
            console.error("Failed to send background web push", err);
        });

        return notification;
    }

    async getNotifications(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);

        return {
            notifications,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }

    async markAsRead(userId: string, notificationId: string) {
        return this.prisma.notification.delete({
            where: { id: notificationId, userId },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.deleteMany({
            where: { userId },
        });
    }

    async deleteNotification(userId: string, notificationId: string) {
        return this.prisma.notification.delete({
            where: { id: notificationId, userId },
        });
    }

    async deleteAllNotifications(userId: string) {
        return this.prisma.notification.deleteMany({
            where: { userId },
        });
    }

    async getUnreadCount(userId: string): Promise<{ count: number }> {
        const count = await this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
        return { count };
    }

    async markConversationNotificationsAsRead(userId: string, conversationId: string) {
        return this.prisma.notification.deleteMany({
            where: {
                userId,
                groupId: conversationId,
            },
        });
    }
}