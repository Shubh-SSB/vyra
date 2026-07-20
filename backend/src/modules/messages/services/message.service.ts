import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
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
}