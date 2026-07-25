import { Injectable } from "@nestjs/common";
import { Message, Prisma, ReactionType } from "@prisma/client";
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
    ) {
        return this.prisma.message.findMany({
            where: {
                conversationId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
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
            },
            orderBy: {
                createdAt: "asc",
            },
        });
    }

    async update(
        id: string,
        data: Prisma.MessageUpdateInput,
    ) {
        return this.prisma.message.update({
            where: { id },
            data,
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
}