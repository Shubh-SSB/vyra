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
                showReadReceipts: true,
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

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find((p) => p.userId === userId);
        const lastReadAt = participant?.lastReadAt;
        const isPinned = participant?.isPinned ?? false;
        const pinnedAt = participant?.pinnedAt ?? null;

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
          isPinned,
          pinnedAt,
        };
      })
    );

    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isPinned && b.isPinned) {
        const aPin = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0;
        const bPin = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0;
        return bPin - aPin;
      }
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
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
                showReadReceipts: true,
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

    async pinConversation(userId: string, conversationId: string) {
        return this.prisma.conversationParticipant.update({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
            data: {
                isPinned: true,
                pinnedAt: new Date(),
            },
        });
    }

    async unpinConversation(userId: string, conversationId: string) {
        return this.prisma.conversationParticipant.update({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
            data: {
                isPinned: false,
                pinnedAt: null,
            },
        });
    }

    async togglePinConversation(userId: string, conversationId: string) {
        const participant = await this.prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
        });

        if (!participant) {
            throw new Error("Conversation participant not found");
        }

        const newIsPinned = !participant.isPinned;

        const updated = await this.prisma.conversationParticipant.update({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
            data: {
                isPinned: newIsPinned,
                pinnedAt: newIsPinned ? new Date() : null,
            },
        });

        return {
            conversationId,
            isPinned: updated.isPinned,
            pinnedAt: updated.pinnedAt,
        };
    }
}