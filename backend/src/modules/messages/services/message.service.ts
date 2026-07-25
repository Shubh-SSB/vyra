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
    ) {}

    async sendMessage(
        senderId: string,
        conversationId: string,
        content: string,
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

        const message =
            await this.messageRepository.create({
                content,
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
                : existingReaction.reaction === ReactionType.CUSTOM && existingReaction.customEmoji === customEmoji;

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
}