import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from "@nestjs/common";
import { CollectionRepository } from "../repositories/collection.repository";

const DEFAULT_COLLECTION_NAME = "Saved Messages";
const DEFAULT_COLLECTION_EMOJI = "📌";

@Injectable()
export class CollectionService {
    constructor(private readonly collectionRepository: CollectionRepository) {}

    // ─── Auto-create default "Saved Messages" for new users ───────────────────

    private async ensureDefaultCollection(userId: string) {
        const count = await this.collectionRepository.countByUser(userId);
        if (count === 0) {
            await this.collectionRepository.create(
                userId,
                DEFAULT_COLLECTION_NAME,
                DEFAULT_COLLECTION_EMOJI,
                true,
            );
        }
    }

    // ─── Collections ───────────────────────────────────────────────────────────

    async getUserCollections(userId: string) {
        await this.ensureDefaultCollection(userId);
        return this.collectionRepository.findByUser(userId);
    }

    async createCollection(userId: string, name: string, emoji?: string) {
        const trimmed = name.trim();
        if (!trimmed) throw new Error("Collection name cannot be empty");

        // Check for duplicate name (Prisma will also throw a unique violation, but this gives a cleaner error)
        const existing = await this.collectionRepository.findByUser(userId);
        const duplicate = existing.find(
            (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (duplicate) {
            throw new ConflictException(`You already have a collection named "${trimmed}"`);
        }

        return this.collectionRepository.create(userId, trimmed, emoji);
    }

    async deleteCollection(userId: string, collectionId: string) {
        const collection = await this.collectionRepository.findById(collectionId);
        if (!collection) throw new NotFoundException("Collection not found");
        if (collection.userId !== userId) throw new ForbiddenException("Not your collection");
        if (collection.isDefault) throw new ForbiddenException("Cannot delete the default collection");

        return this.collectionRepository.delete(collectionId);
    }

    // ─── Items ──────────────────────────────────────────────────────────────────

    async getCollectionItems(userId: string, collectionId: string) {
        const collection = await this.collectionRepository.findById(collectionId);
        if (!collection) throw new NotFoundException("Collection not found");
        if (collection.userId !== userId) throw new ForbiddenException("Not your collection");

        return this.collectionRepository.findItems(collectionId);
    }

    async saveToCollection(userId: string, collectionId: string, messageId: string) {
        const collection = await this.collectionRepository.findById(collectionId);
        if (!collection) throw new NotFoundException("Collection not found");
        if (collection.userId !== userId) throw new ForbiddenException("Not your collection");

        const alreadySaved = await this.collectionRepository.itemExists(collectionId, messageId);
        if (alreadySaved) throw new ConflictException("Message already saved to this collection");

        return this.collectionRepository.addItem(collectionId, messageId);
    }

    async unsaveFromCollection(userId: string, collectionId: string, messageId: string) {
        const collection = await this.collectionRepository.findById(collectionId);
        if (!collection) throw new NotFoundException("Collection not found");
        if (collection.userId !== userId) throw new ForbiddenException("Not your collection");

        return this.collectionRepository.removeItem(collectionId, messageId);
    }

    async moveToCollection(
        userId: string,
        fromCollectionId: string,
        toCollectionId: string,
        messageId: string,
    ) {
        const [from, to] = await Promise.all([
            this.collectionRepository.findById(fromCollectionId),
            this.collectionRepository.findById(toCollectionId),
        ]);
        if (!from || !to) throw new NotFoundException("Collection not found");
        if (from.userId !== userId || to.userId !== userId)
            throw new ForbiddenException("Not your collection");

        const alreadyInTarget = await this.collectionRepository.itemExists(toCollectionId, messageId);
        if (alreadyInTarget) throw new ConflictException("Message already exists in target collection");

        return this.collectionRepository.moveItem(fromCollectionId, toCollectionId, messageId);
    }

    async copyToCollection(
        userId: string,
        fromCollectionId: string,
        toCollectionId: string,
        messageId: string,
    ) {
        const [from, to] = await Promise.all([
            this.collectionRepository.findById(fromCollectionId),
            this.collectionRepository.findById(toCollectionId),
        ]);
        if (!from || !to) throw new NotFoundException("Collection not found");
        if (from.userId !== userId || to.userId !== userId)
            throw new ForbiddenException("Not your collection");

        const alreadyInTarget = await this.collectionRepository.itemExists(toCollectionId, messageId);
        if (alreadyInTarget) throw new ConflictException("Message already exists in target collection");

        return this.collectionRepository.copyItem(toCollectionId, messageId);
    }

    async getMessageSavedStatus(userId: string, messageId: string) {
        return this.collectionRepository.getMessageSavedStatus(userId, messageId);
    }
}
