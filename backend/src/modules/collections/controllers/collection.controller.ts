import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Patch,
    Req,
    UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ApiResponseUtil } from "../../../common/utils/api-response";
import { CollectionService } from "../services/collection.service";

@Controller("collections")
@UseGuards(JwtAuthGuard)
export class CollectionController {
    constructor(private readonly collectionService: CollectionService) {}

    // ─── GET /collections ──────────────────────────────────────────────────────
    @Get()
    async getUserCollections(@Req() req) {
        const collections = await this.collectionService.getUserCollections(req.user.id);
        return ApiResponseUtil.success(collections, "Collections fetched successfully");
    }

    // ─── POST /collections ─────────────────────────────────────────────────────
    @Post()
    async createCollection(
        @Req() req,
        @Body() dto: { name: string; emoji?: string },
    ) {
        const collection = await this.collectionService.createCollection(
            req.user.id,
            dto.name,
            dto.emoji,
        );
        return ApiResponseUtil.success(collection, "Collection created successfully");
    }

    // ─── DELETE /collections/:id ───────────────────────────────────────────────
    @Delete(":id")
    async deleteCollection(@Req() req, @Param("id") id: string) {
        await this.collectionService.deleteCollection(req.user.id, id);
        return ApiResponseUtil.success(null, "Collection deleted successfully");
    }

    // ─── GET /collections/:id/items ────────────────────────────────────────────
    @Get(":id/items")
    async getCollectionItems(@Req() req, @Param("id") id: string) {
        const items = await this.collectionService.getCollectionItems(req.user.id, id);
        return ApiResponseUtil.success(items, "Collection items fetched successfully");
    }

    // ─── POST /collections/:id/items  { messageId } ────────────────────────────
    @Post(":id/items")
    async saveToCollection(
        @Req() req,
        @Param("id") id: string,
        @Body() dto: { messageId: string },
    ) {
        const item = await this.collectionService.saveToCollection(
            req.user.id,
            id,
            dto.messageId,
        );
        return ApiResponseUtil.success(item, "Message saved to collection");
    }

    // ─── DELETE /collections/:id/items/:messageId ──────────────────────────────
    @Delete(":id/items/:messageId")
    async unsaveFromCollection(
        @Req() req,
        @Param("id") id: string,
        @Param("messageId") messageId: string,
    ) {
        await this.collectionService.unsaveFromCollection(req.user.id, id, messageId);
        return ApiResponseUtil.success(null, "Message removed from collection");
    }

    /**
     * PATCH /collections/:id/items/:messageId
     * Body: { targetCollectionId, action: "move" | "copy" }
     */
    @Patch(":id/items/:messageId")
    async transferItem(
        @Req() req,
        @Param("id") fromId: string,
        @Param("messageId") messageId: string,
        @Body() dto: { targetCollectionId: string; action: "move" | "copy" },
    ) {
        if (dto.action === "move") {
            await this.collectionService.moveToCollection(
                req.user.id,
                fromId,
                dto.targetCollectionId,
                messageId,
            );
            return ApiResponseUtil.success(null, "Message moved successfully");
        } else {
            await this.collectionService.copyToCollection(
                req.user.id,
                fromId,
                dto.targetCollectionId,
                messageId,
            );
            return ApiResponseUtil.success(null, "Message copied successfully");
        }
    }

    // ─── GET /collections/message/:messageId/status ────────────────────────────
    // Returns array of collectionIds that contain this message (for the save modal checkmarks)
    // NOTE: must be before /:id to avoid param shadowing
    @Get("message/:messageId/status")
    async getMessageSavedStatus(
        @Req() req,
        @Param("messageId") messageId: string,
    ) {
        const savedIn = await this.collectionService.getMessageSavedStatus(
            req.user.id,
            messageId,
        );
        return ApiResponseUtil.success(savedIn, "Message saved status fetched");
    }
}
