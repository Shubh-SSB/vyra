import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import { ReactionType } from "@prisma/client";
import { ConversationRepository } from "../../conversations/repositories/conversation.repository";
import { MessageRepository } from "../repositories/message.repoitory";

@Injectable()
export class MessagesService {
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly conversationRepository: ConversationRepository,
    ) { }

    private async validateReplyMessage(
        replyToId: string,
        conversationId: string,
    ) {
        const replyMessage = await this.messageRepository.findById(replyToId);

        if (!replyMessage) {
            throw new NotFoundException(
                "Reply message not found",
            )
        }

        if (replyMessage.conversationId !== conversationId) {
            throw new BadRequestException(
                "Reply message does not belong to the same conversation",
            )
        }
    }

    async sendMessage(
        senderId: string,
        conversationId: string,
        content: string,
        replyToId?: string
    ) {

        content = content.trim();

        if (content.length === 0) {
            throw new BadRequestException(
                "Message content cannot be empty",
            );
        }

        if (content.length > 4000) {
            throw new BadRequestException(
                "Message content cannot exceed 4000 characters",
            );
        }

        const conversation =
            await this.conversationRepository.findById(
                conversationId,
            );

        if (!conversation) {
            throw new NotFoundException(
                "Conversation not found",
            );
        }

        const isParticipant =
            await this.conversationRepository.isParticipant(
                conversationId,
                senderId,
            );

        if (!isParticipant) {
            throw new ForbiddenException(
                "You are not a participant of this conversation",
            );
        }

        if (replyToId) {
            await this.validateReplyMessage(replyToId, conversationId);
        }



        const message =
            await this.messageRepository.create({
                content,
                replyTo: replyToId ? { connect: { id: replyToId } } : undefined,
                sender: {
                    connect: {
                        id: senderId,
                    },
                },
                conversation: {
                    connect: {
                        id: conversationId,
                    },
                },
            });

        await this.conversationRepository.updateLastMessageAt(
            conversationId,
        );

        await this.conversationRepository.updateLastReadAt(
            conversationId,
            senderId,
            message.createdAt,
        );

        return message;
    }

    async getConversationMessages(
        userId: string,
        conversationId: string,
        cursor?: string,
        limit?: number,
    ) {
        const isParticipant =
            await this.conversationRepository.isParticipant(
                conversationId,
                userId,
            );

        if (!isParticipant) {
            throw new ForbiddenException(
                "You are not a participant of this conversation",
            );
        }

        return this.messageRepository.findConversationMessages(
            conversationId,
            userId,
            cursor,
            limit,
        );
    }

    async toggleReaction(
        userId: string,
        messageId: string,
        reactionStr: string,
    ) {
        const message = await this.messageRepository.findById(messageId);
        if (!message) {
            throw new NotFoundException("Message not found");
        }

        const isParticipant = await this.conversationRepository.isParticipant(
            message.conversationId,
            userId,
        );
        if (!isParticipant) {
            throw new ForbiddenException(
                "You are not a participant of this conversation",
            );
        }

        // Determine if standard reaction or custom emoji
        const upperReaction = reactionStr.toUpperCase();
        const isStandard = upperReaction in ReactionType && upperReaction !== "CUSTOM";

        const reactionType = isStandard ? (upperReaction as ReactionType) : ReactionType.CUSTOM;
        const customEmoji = isStandard ? null : reactionStr;

        const existingReaction = await this.messageRepository.findReaction(
            userId,
            messageId,
        );

        if (existingReaction) {
            const isSame = isStandard
                ? existingReaction.reaction === reactionType
                : existingReaction.reaction === ReactionType.CUSTOM && existingReaction?.customEmoji === customEmoji;

            if (isSame) {
                // If it is the same reaction, toggle it off (delete it)
                await this.messageRepository.deleteReaction(userId, messageId);
            } else {
                // If it is a different reaction, update it
                await this.messageRepository.updateReaction(userId, messageId, reactionType, customEmoji);
            }
        } else {
            // Otherwise, create the new reaction
            await this.messageRepository.createReaction(userId, messageId, reactionType, customEmoji || undefined);
        }

        // Fetch all updated reactions for the message to return/broadcast
        const updatedReactions = await this.messageRepository.findMessageReactions(messageId);

        return {
            messageId,
            conversationId: message.conversationId,
            reactions: updatedReactions,
        };
    }

    async editMessage(
        userId: string,
        messageId: string,
        content: string,
    ) {
        const message = await this.messageRepository.findById(messageId);
        const messageEditWindow = 15 * 60 * 1000;


        if (!message) {
            throw new NotFoundException("Message not found");
        }

        if (message.senderId !== userId) {
            throw new ForbiddenException(
                "You can only edit your messages",
            );
        }

        if (message.deletedAt) {
            throw new BadRequestException(
                "You cannot edit a deleted message",
            );
        }

        if (Date.now() > message.createdAt.getTime() + messageEditWindow) {
            throw new BadRequestException(
                "You can only edit messages within 15 minutes of sending them",
            );
        }

        const trimmedContent = content.trim();

        if (!trimmedContent) {
            throw new BadRequestException(
                "Message content cannot be empty",
            );
        }

        if (trimmedContent.length > 4000) {
            throw new BadRequestException(
                "Message content cannot exceed 4000 characters",
            );
        }

        return this.messageRepository.update(messageId, trimmedContent);
    }


    async getHiddenMessages(userId: string) {
        return this.messageRepository.findHiddenMessages(userId);
    }

    async unhideMessage(userId: string, messageId: string) {
        // verify the message exists
        const message = await this.messageRepository.findById(messageId);
        if (!message) throw new NotFoundException('Message not found');
        return this.messageRepository.unhideForMe(messageId, userId);
    }

    async deleteForMe(userId: string, messageId: string) {
        const message = await this.messageRepository.findById(messageId);

        if (!message) throw new NotFoundException("Message not found");

        const isParticipant = await this.conversationRepository.isParticipant(
            message.conversationId,
            userId,
        )

        if (!isParticipant) throw new ForbiddenException(
            "You are not a participant of this conversation",
        );

        const result = await this.messageRepository.softDeleteForMe(messageId, userId);

        return {
            ...result,
            conversationId: message.conversationId,
            deleteType: "FOR_ME",
        }
    }

    async deleteForEveryone(userId: string, messageId: string) {
        const message = await this.messageRepository.findById(messageId);

        if (!message) throw new NotFoundException("Message not found");

        if (message.senderId !== userId) {
            throw new ForbiddenException(
                "You can only delete your own messages for everyone",
            );
        }

        if (message.deletedAt) {
            throw new BadRequestException(
                "This message has already been deleted for everyone",
            );
        }

        const result = await this.messageRepository.softDeleteForEveryone(messageId, userId);

        return {
            ...result,
            conversationId: message.conversationId,
            deleteType: "FOR_EVERYONE" as const,
        }
    }

    async hideMessage(userId: string, messageId: string) {
        const message = await this.messageRepository.findById(messageId);

        if (!message) throw new NotFoundException("Message not found");

        const isParticipant = await this.conversationRepository.isParticipant(
            message.conversationId,
            userId,
        )

        if (!isParticipant) throw new ForbiddenException(
            "You are not a participant of this conversation",
        );

        await this.messageRepository.hideForMe(messageId, userId);

        return {
            messageId,
            conversationId: message.conversationId,
            hidden: true,
        }
    }

    async forwardMessages(
        senderId: string,
        messageIds: string[],
        conversationIds: string[],
    ) {
        if (!messageIds.length || !conversationIds.length) {
            throw new BadRequestException("messageIds and conversationIds must be non-empty arrays");
        }

        // Fetch originals
        const originals = await this.messageRepository.findManyByIds(messageIds);
        if (originals.length === 0) throw new NotFoundException("No messages found to forward");

        // Validate sender is participant in all target conversations
        for (const convId of conversationIds) {
            const isParticipant = await this.conversationRepository.isParticipant(convId, senderId);
            if (!isParticipant) {
                throw new ForbiddenException(`You are not a participant of conversation ${convId}`);
            }
        }

        const forwarded: any[] = [];
        for (const convId of conversationIds) {
            for (const original of originals) {
                if (original.deletedAt) continue; // skip deleted
                const msg = await this.messageRepository.createForwarded({
                    content: original.content,
                    senderId,
                    conversationId: convId,
                    forwardedFromId: original.id,
                });
                forwarded.push({ ...msg, conversationId: convId });
                await this.conversationRepository.updateLastMessageAt(convId);
                await this.conversationRepository.updateLastReadAt(convId, senderId, msg.createdAt);
            }
        }

        return forwarded;
    }

    async bulkDeleteForMe(userId: string, messageIds: string[]) {
        if (!messageIds.length) throw new BadRequestException("messageIds must be non-empty");
        return this.messageRepository.bulkDeleteForMe(messageIds, userId);
    }

    async bulkDeleteForEveryone(userId: string, messageIds: string[]) {
        if (!messageIds.length) throw new BadRequestException("messageIds must be non-empty");
        // Only own messages can be deleted for everyone
        return this.messageRepository.bulkDeleteForEveryone(messageIds, userId);
    }

    async bulkHideMessages(userId: string, messageIds: string[]) {
        if (!messageIds.length) throw new BadRequestException("messageIds must be non-empty");
        return this.messageRepository.bulkHideForMe(messageIds, userId);
    }
}