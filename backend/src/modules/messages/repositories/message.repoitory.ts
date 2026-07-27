import { Injectable } from "@nestjs/common";
import { Prisma, ReactionType } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class MessageRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async create(
        data: Prisma.MessageCreateInput,
    ) {
        return this.prisma.message.create({
            data,
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
                replyTo: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findById(
        id: string,
    ) {
        return this.prisma.message.findUnique({
            where: { id },
            include: {
                reactions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findConversationMessages(
        conversationId: string,
        userId: string,
        cursor?: string,
        limit: number = 40,
    ) {
        const queryOptions: Prisma.MessageFindManyArgs = {
            where: {
                conversationId,
            hiddenBy: {
                none: { userId },
            },
        },

            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
                replyTo: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                            },
                        },
                    },
                },
                reactions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                            },
                        },
                    },
                },
                savedIn: {
                    where: {
                        collection: {
                            userId,
                        },
                    },
                    select: {
                        collectionId: true,
                    },
                },
            },
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        };

        if (cursor) {
            queryOptions.cursor = { id: cursor };
            queryOptions.skip = 1;
        }

        const messages = await this.prisma.message.findMany(queryOptions);
        return messages.reverse();
    }

    async update(
        id: string,
        content: string,
    ) {
        return this.prisma.message.update({
            where: { id },
            data: {
                content,
                editedAt: new Date(),
            },
            select: {
                        id: true,
                        conversationId: true,
                        content: true,
                        editedAt: true,
                        sender: {
                            select: {
                                id:true,
                                username: true,
                                displayName: true,
                            }
                        }
                    },
        });
    }

    async delete(id: string) {
        return this.prisma.message.delete({
            where: { id },
        });
    }

    async findReaction(userId: string, messageId: string) {
        return this.prisma.messageReaction.findUnique({
            where: {
                messageId_userId: {
                    messageId,
                    userId,
                },
            },
        });
    }

    async createReaction(userId: string, messageId: string, reaction: ReactionType, customEmoji?: string) {
        return this.prisma.messageReaction.create({
            data: {
                userId,
                messageId,
                reaction,
                customEmoji,
            },
        });
    }

    async updateReaction(userId: string, messageId: string, reaction: ReactionType, customEmoji?: string | null) {
        return this.prisma.messageReaction.update({
            where: {
                messageId_userId: {
                    messageId,
                    userId,
                },
            },
            data: {
                reaction,
                customEmoji,
            },
        });
    }

    async deleteReaction(userId: string, messageId: string) {
        return this.prisma.messageReaction.delete({
            where: {
                messageId_userId: {
                    messageId,
                    userId,
                },
            },
        });
    }

    async findHiddenMessages(userId: string) {
        const hides = await this.prisma.messageHide.findMany({
            where: { userId },
            include: {
                message: {
                    include: {
                        sender: {
                            select: { id: true, username: true, displayName: true, avatarUrl: true },
                        },
                        conversation: {
                            select: { id: true, type: true },
                        },
                    },
                },
            },
            orderBy: { hiddenAt: 'desc' },
        });
        return hides.map((h) => ({ ...h.message, hiddenAt: h.hiddenAt }));
    }

    async unhideForMe(messageId: string, userId: string) {
        return this.prisma.messageHide.delete({
            where: { messageId_userId: { messageId, userId } },
        });
    }

    async findMessageReactions(messageId: string) {
        return this.prisma.messageReaction.findMany({
            where: {
                messageId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
            },
        });
    }

    async softDeleteForMe(messageId: string, userId: string) {
        return this.prisma.message.update({
            where: { id: messageId },
            data: {
                deletedAt: new Date(),
                deleteById: userId,
            },
            select: { id: true, conversationId: true, deletedAt: true, deleteById: true },
        })
    }

    async softDeleteForEveryone(messageId: string, deletedById: string) {
        return this.prisma.message.update({
            where: { id: messageId },
            data: {
                deletedAt: new Date(),
                deleteById: deletedById,
                content: 'This message is no longer available.',
            },
            select: { id: true, conversationId: true, deletedAt: true, deleteById: true },
        })
    }

    async hideForMe(messageId: string, userId: string) {
        return this.prisma.messageHide.upsert({
            where: { messageId_userId: { messageId, userId } },
            create: { messageId, userId },
            update: { messageId, userId },
        })
    }

    async isHiddenByUser(messageId: string, userId: string): Promise<boolean> {
        const record = await this.prisma.messageHide.findUnique({
            where: { messageId_userId: { messageId, userId } },
        });
        return !!record;
    }
}