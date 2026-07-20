import { Injectable } from "@nestjs/common";
import { Message, Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class MessageRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async create(
        data: Prisma.MessageCreateInput,
    ): Promise<Message> {
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
    ): Promise<Message | null> {
        return this.prisma.message.findUnique({
            where: { id },
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
}