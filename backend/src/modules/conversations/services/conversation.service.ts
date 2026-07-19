import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { ConversationRepository } from "../repositories/conversation.repository";

@Injectable()
export class ConversationsService {
    constructor(
        private readonly conversationRepository: ConversationRepository,
    ) {}

    async createDirectConversation(
        currentUserId: string,
        targetUserId: string,
    ) {
        if (currentUserId === targetUserId) {
            throw new BadRequestException(
                "You cannot create a conversation with yourself.",
            );
        }

        const existingConversation =
            await this.conversationRepository.findDirectConversation(
                currentUserId,
                targetUserId,
            );

        if (
            existingConversation &&
            existingConversation.participants.length === 2
        ) {
            return existingConversation;
        }

        return this.conversationRepository.createDirectConversation(
            currentUserId,
            targetUserId,
        );
    }

    async getUserConversations(userId: string) {
        return this.conversationRepository.findUserConversations(userId);
    }

    async findById(id: string) {
        const conversation =
            await this.conversationRepository.findById(id);

        if (!conversation) {
            throw new NotFoundException(
                "Conversation not found.",
            );
        }

        return conversation;
    }

    async deleteConversation(id: string) {
        const conversation =
            await this.conversationRepository.findById(id);

        if (!conversation) {
            throw new NotFoundException(
                "Conversation not found.",
            );
        }

        return this.conversationRepository.delete(id);
    }
}