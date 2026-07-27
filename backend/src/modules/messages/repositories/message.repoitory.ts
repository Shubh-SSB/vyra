import { Injectable } from "@nestjs/common";
import { Prisma, ReactionType, MessageType, AttachmentType, AttachmentStatus } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class MessageRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(
        data: Prisma.MessageCreateInput,
        tx?: Prisma.TransactionClient,
    ) {
        const client = tx || this.prisma;
        return client.message.create({
            data,
            include: {
                attachments: true,
                sender: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
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
                attachments: true,
                sender: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
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
                        id: true,
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
                        attachments: true,
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

    async createForwarded(data: {
        content: string | null;
        senderId: string;
        conversationId: string;
        forwardedFromId: string;
        type?: MessageType;
        attachments?: {
            type: AttachmentType;
            mimeType: string;
            size: number;
            storageKey: string;
            fileUrl: string;
            metadata?: any;
        }[];
    }) {
        return this.prisma.message.create({
            data: {
                content: data.content,
                isForwarded: true,
                forwardedFromId: data.forwardedFromId,
                senderId: data.senderId,
                conversationId: data.conversationId,
                type: data.type,
                attachments: data.attachments ? {
                    create: data.attachments.map(att => ({
                        type: att.type,
                        mimeType: att.mimeType,
                        size: att.size,
                        storageKey: att.storageKey + "-fwd-" + Date.now(),
                        fileUrl: att.fileUrl,
                        status: AttachmentStatus.ACTIVE,
                        processingStatus: "READY",
                        metadata: att.metadata || undefined,
                    }))
                } : undefined,
            },
            include: {
                attachments: true,
                sender: {
                    select: { id: true, username: true, displayName: true, avatarUrl: true },
                },
            },
        });
    }

    async bulkDeleteForMe(messageIds: string[], userId: string) {
        // Filter to messages that belong to conversations the user is in
        // We soft-hide them by inserting MessageHide records
        const existing = await this.prisma.messageHide.findMany({
            where: { userId, messageId: { in: messageIds } },
            select: { messageId: true },
        });
        const existingIds = new Set(existing.map((e) => e.messageId));
        const toCreate = messageIds.filter((id) => !existingIds.has(id));

        if (toCreate.length > 0) {
            await this.prisma.messageHide.createMany({
                data: toCreate.map((messageId) => ({ messageId, userId })),
                skipDuplicates: true,
            });
        }
        return { count: toCreate.length };
    }

    async bulkDeleteForEveryone(messageIds: string[], senderId: string) {
        const result = await this.prisma.message.updateMany({
            where: {
                id: { in: messageIds },
                senderId,
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
                deleteById: senderId,
                content: 'This message is no longer available.',
            },
        });
        return result;
    }

    async bulkHideForMe(messageIds: string[], userId: string) {
        const existing = await this.prisma.messageHide.findMany({
            where: { userId, messageId: { in: messageIds } },
            select: { messageId: true },
        });
        const existingIds = new Set(existing.map((e) => e.messageId));
        const toCreate = messageIds.filter((id) => !existingIds.has(id));

        if (toCreate.length > 0) {
            await this.prisma.messageHide.createMany({
                data: toCreate.map((messageId) => ({ messageId, userId })),
                skipDuplicates: true,
            });
        }
        return { count: toCreate.length };
    }

    async findManyByIds(messageIds: string[]) {
        return this.prisma.message.findMany({
            where: { id: { in: messageIds } },
            include: {
                attachments: true,
            },
        });
    }
}
