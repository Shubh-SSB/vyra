import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class CollectionRepository {
    constructor(private readonly prisma: PrismaService) {}

    // ─── User Collections ──────────────────────────────────────────────────────

    async findByUser(userId: string) {
        return this.prisma.collection.findMany({
            where: { userId },
            include: {
                _count: { select: { items: true } },
            },
            orderBy: [
                { isDefault: "desc" }, // default "Saved Messages" always first
                { createdAt: "asc" },
            ],
        });
    }

    async findById(id: string) {
        return this.prisma.collection.findUnique({
            where: { id },
            include: { _count: { select: { items: true } } },
        });
    }

    async create(userId: string, name: string, emoji?: string, isDefault = false) {
        return this.prisma.collection.create({
            data: { userId, name, emoji, isDefault },
            include: { _count: { select: { items: true } } },
        });
    }

    async delete(id: string) {
        return this.prisma.collection.delete({ where: { id } });
    }

    async countByUser(userId: string) {
        return this.prisma.collection.count({ where: { userId } });
    }

    // ─── Collection Items ──────────────────────────────────────────────────────

    async findItems(collectionId: string) {
        return this.prisma.collectionItem.findMany({
            where: { collectionId },
            include: {
                message: {
                    include: {
                        sender: {
                            select: { id: true, username: true, displayName: true, avatarUrl: true },
                        },
                        conversation: {
                            select: { id: true, type: true },
                        },
                        replyTo: {
                            select: { id: true, content: true, senderId: true },
                        },
                    },
                },
            },
            orderBy: { savedAt: "desc" },
        });
    }

    async addItem(collectionId: string, messageId: string) {
        return this.prisma.collectionItem.create({
            data: { collectionId, messageId },
        });
    }

    async removeItem(collectionId: string, messageId: string) {
        return this.prisma.collectionItem.delete({
            where: { collectionId_messageId: { collectionId, messageId } },
        });
    }

    async itemExists(collectionId: string, messageId: string) {
        const item = await this.prisma.collectionItem.findUnique({
            where: { collectionId_messageId: { collectionId, messageId } },
        });
        return !!item;
    }

    /** Move a message from one collection to another atomically */
    async moveItem(fromCollectionId: string, toCollectionId: string, messageId: string) {
        return this.prisma.$transaction([
            this.prisma.collectionItem.delete({
                where: { collectionId_messageId: { collectionId: fromCollectionId, messageId } },
            }),
            this.prisma.collectionItem.create({
                data: { collectionId: toCollectionId, messageId },
            }),
        ]);
    }

    /** Copy a message to another collection without removing it from the source */
    async copyItem(toCollectionId: string, messageId: string) {
        return this.prisma.collectionItem.create({
            data: { collectionId: toCollectionId, messageId },
        });
    }

    /** Which of the user's collections already contain this message */
    async getMessageSavedStatus(userId: string, messageId: string) {
        const items = await this.prisma.collectionItem.findMany({
            where: {
                messageId,
                collection: { userId },
            },
            select: { collectionId: true },
        });
        return items.map((i) => i.collectionId);
    }
}
