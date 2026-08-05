import { Injectable } from "@nestjs/common";
import { NotificationService } from "../services/notification.service";
import { OnEvent } from "@nestjs/event-emitter";
import { NotificationType } from "@prisma/client";


@Injectable()
export class NotificationEventListener {
    constructor(private readonly notificationService: NotificationService) { }

    @OnEvent("message.created")
    async handleMessageCreated(payload: { message: any; recipientIds: string[] }) {
        const { message, recipientIds } = payload;
        for (const recipientId of recipientIds) {
            await this.notificationService.createNotification(
                recipientId,
                NotificationType.NEW_MESSAGE,
                message.sender.displayName,
                message.content || (message.type === "VOICE" ? "Sent a voice message" : "Sent an attachment"),
                { conversationId: message.conversationId, messageId: message.id, senderId: message.senderId },
                message.conversationId,
            );
        }
    }

    @OnEvent("friend-request.created")
    async handleFriendRequestCreated(payload: { sender: any; receiverId: string; requestId: string }) {
        const { sender, receiverId, requestId } = payload;
        await this.notificationService.createNotification(
            receiverId,
            NotificationType.FRIEND_REQUEST,
            "New Friend Request",
            `${sender.displayName} sent you a friend request.`,
            { senderId: sender.id, requestId },
        );
    }

    @OnEvent("message.reacted")
    async handleMessageReacted(payload: {
        message: any;
        reactor: any;
        reaction: string;
    }) {
        const { message, reactor, reaction } = payload;

        if (message.senderId === reactor.id) return;

        await this.notificationService.createNotification(
            message.senderId,
            NotificationType.MESSAGE_REACTION,
            "New Reaction",
            `${reactor.displayName} reacted ${reaction} to your message.`,
            {
                conversationId: message.conversationId,
                messageId: message.id,
                reactorId: reactor.id,
            },
        );
    }

    @OnEvent("message.pinned")
    async handleMessagePinned(payload: {
        message: any;
        pinner: any;
        recipientIds: string[];
    }) {
        const { message, pinner, recipientIds } = payload;

        for (const recipientId of recipientIds) {
            if (recipientId === pinner.id) continue;

            await this.notificationService.createNotification(
                recipientId,
                NotificationType.MESSAGE_PIN,
                "Pinned Message",
                `${pinner.displayName} pinned a message in the chat.`,
                {
                    conversationId: message.conversationId,
                    messageId: message.id,
                    pinnerId: pinner.id,
                },
                message.conversationId,
            );
        }
    }
}