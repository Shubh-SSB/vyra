import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { ConversationRepository } from './repositories/conversation.repository';

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
        "You can't create a conversation with yourself.",
      );
    }

    const existingConversation =
      await this.conversationRepository.findDirectConversation(
        currentUserId,
        targetUserId,
      );

    if (existingConversation && existingConversation.participants.length === 2) {
      return existingConversation;
    }
  }

  async getUserConversations(userId: string) {
    return this.conversationRepository.findUserConversations(userId);
  }

  async findById(id: string) {
    return this.conversationRepository.findById(id);
  }

  async deleteConversation(id: string) {
    return this.conversationRepository.delete(id);
  }
}