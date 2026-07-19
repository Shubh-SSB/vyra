import { Injectable } from '@nestjs/common';
import {
  Conversation,
  Prisma,
  ConversationType,
  ParticipantRole,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ConversationRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    data: Prisma.ConversationCreateInput,
  ): Promise<Conversation> {
    return this.prisma.conversation.create({
      data,
    });
  }

  async findById(
    id: string,
  ): Promise<Conversation | null> {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  async findUserConversations(
    userId: string,
  ) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });
  }

  async findDirectConversation(
    currentUserId: string,
    targetUserId: string,
  ) {
    return this.prisma.conversation.findFirst({
      where: {
        type: ConversationType.DIRECT,

        AND: [
          {
            participants: {
              some: {
                userId: currentUserId,
              },
            },
          },
          {
            participants: {
              some: {
                userId: targetUserId,
              },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async delete(
    id: string,
  ): Promise<Conversation> {
    return this.prisma.conversation.delete({
      where: {
        id,
      },
    });
  }

  async createDirectConversation(
        currentUserId: string,
        targetUserId: string,
    ): Promise<Conversation> {
        return this.prisma.$transaction(async (tx) => {
            return tx.conversation.create({
                data: {
                    type: ConversationType.DIRECT,

                    participants: {
                        create: [
                            {
                                user: {
                                    connect: {
                                        id: currentUserId,
                                    },
                                },
                                role: ParticipantRole.MEMBER,
                            },
                            {
                                user: {
                                    connect: {
                                        id: targetUserId,
                                    },
                                },
                                role: ParticipantRole.MEMBER,
                            },
                        ],
                    },
                },
            });
        });
    }
}