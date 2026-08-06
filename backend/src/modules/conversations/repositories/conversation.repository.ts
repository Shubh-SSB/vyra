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
  ) {
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
          include: {
            attachments: true,
          },
        },
      },
    });
  }

  async findUserConversations(
    userId: string,
  ) {
    const conversations = await this.prisma.conversation.findMany({
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
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                email: true,
                avatarUrl: true,
                bannerUrl: true,
                bio: true,
                lastSeen: true,
                isEmailVerified: true,
                isPhoneVerified: true,
              },
            }
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            attachments: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    return Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find((p) => p.userId === userId);
        const lastReadAt = participant?.lastReadAt;

        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            hiddenBy: { none: { userId } },
            ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
          },
        });

        return {
          ...conv,
          unreadCount,
        };
      })
    );
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
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                email: true,
                avatarUrl: true,
                bannerUrl: true,
                bio: true,
                lastSeen: true,
                isEmailVerified: true,
                isPhoneVerified: true,
              },
            }
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

    async isParticipant(
        conversationId: string,
        userId: string,
    ): Promise<boolean> {

        const participant =
            await this.prisma.conversationParticipant.findUnique({
                where: {
                    conversationId_userId: {
                        conversationId,
                        userId,
                    },
                },
            });

        return !!participant;
    }

    async updateLastMessageAt(
        conversationId: string,
    ) {
        return this.prisma.conversation.update({
            where: {
                id: conversationId,
            },
            data: {
                lastMessageAt: new Date(),
            },
        });
    }

    async updateLastReadAt(
        conversationId: string,
        userId: string,
        timestamp: Date,
    ) {
        return this.prisma.conversationParticipant.update({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
            data: {
                lastReadAt: timestamp,
            },
        });
    }

    async clearMessages(conversationId: string) {
        return this.prisma.message.deleteMany({
            where: { conversationId },
        });
    }
}