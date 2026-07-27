import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
    forwardRef,
} from "@nestjs/common";

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ApiResponseUtil } from "../../../common/utils/api-response";
import { MessagesService } from "../services/message.service";
import { SendMessageDto } from "../dto/send-message.dto";
import { ChatGateway } from "../../../socket/gateways/chat.gateway";
import { EditMessageDto } from "../dto/edit-message.dto";
import { ForwardMessagesDto } from "../dto/forward-messages.dto";
import { BulkActionDto } from "../dto/bulk-action.dto";

@Controller("messages")
@UseGuards(JwtAuthGuard)
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService,
        @Inject(forwardRef(() => ChatGateway))
        private readonly chatGateway: ChatGateway,
    ) { }

    @Post()
    async sendMessage(
        @Req() req,
        @Body() dto: SendMessageDto,
    ) {
        const attachmentIds = dto.attachments?.map((att) => att.id);
        const message =
            await this.messagesService.sendMessage(
                req.user.id,
                dto.conversationId,
                dto.content,
                dto.replyToId,
                dto.type,
                attachmentIds,
            );

        return ApiResponseUtil.success(
            message,
            "Message sent successfully",
        );
    }

    // ─── Literal routes MUST come before wildcard param routes ──────────────────
    @Get("hidden")
    async getHiddenMessages(@Req() req) {
        const messages = await this.messagesService.getHiddenMessages(req.user.id);
        return ApiResponseUtil.success(messages, "Hidden messages fetched successfully");
    }

    @Post("forward")
    async forwardMessages(
        @Req() req,
        @Body() dto: ForwardMessagesDto,
    ) {
        const forwarded = await this.messagesService.forwardMessages(
            req.user.id,
            dto.messageIds,
            dto.conversationIds,
        );

        // Broadcast each forwarded message on the socket
        for (const msg of forwarded) {
            this.chatGateway.broadcastNewMessage(msg.conversationId, msg);
        }

        return ApiResponseUtil.success(forwarded, "Messages forwarded successfully");
    }

    @Delete("bulk/me")
    async bulkDeleteForMe(
        @Req() req,
        @Body() dto: BulkActionDto,
    ) {
        const result = await this.messagesService.bulkDeleteForMe(req.user.id, dto.messageIds);
        return ApiResponseUtil.success(result, "Messages deleted for you successfully");
    }

    @Delete("bulk/everyone")
    async bulkDeleteForEveryone(
        @Req() req,
        @Body() dto: BulkActionDto,
    ) {
        const result = await this.messagesService.bulkDeleteForEveryone(req.user.id, dto.messageIds);
        return ApiResponseUtil.success(result, "Messages deleted for everyone successfully");
    }

    @Post("bulk/hide")
    async bulkHide(
        @Req() req,
        @Body() dto: BulkActionDto,
    ) {
        const result = await this.messagesService.bulkHideMessages(req.user.id, dto.messageIds);
        return ApiResponseUtil.success(result, "Messages hidden successfully");
    }

    @Get(":conversationId")
    async getConversationMessages(
        @Req() req,
        @Param("conversationId") conversationId: string,
        @Query("cursor") cursor?: string,
        @Query("limit") limit?: string,
    ) {
        const take = limit ? parseInt(limit, 10) : 40;
        const messages =
            await this.messagesService.getConversationMessages(
                req.user.id,
                conversationId,
                cursor,
                take,
            );

        return ApiResponseUtil.success(
            messages,
            "Messages fetched successfully",
        );
    }

    @Post("/reactions")
    async addReaction(
        @Req() req,
        @Body() dto: { messageId: string; reaction: string },
    ) {
        const { messageId, reaction } = dto;
        const result = await this.messagesService.toggleReaction(
            req.user.id,
            messageId,
            reaction
        );

        this.chatGateway.broadcastReactionUpdate(
            result.conversationId,
            result.messageId,
            result.reactions,
        );

        return ApiResponseUtil.success(result, "Reaction updated successfully");
    }

    @Patch(":messageId")
    async editMessage(
        @Req() req,
        @Param("messageId") messageId: string,
        @Body() dto: EditMessageDto,
    ) {
        const message = await this.messagesService.editMessage(
            req.user.id,
            messageId,
            dto.content
        );

        this.chatGateway.broadcastMessageEdited(
            message.conversationId,
            {
                id: message.id,
                content: message.content,
                editedAt: message.editedAt,
            }
        );

        return ApiResponseUtil.success(
            message,
            "Message updated successfully",
        );
    }

    @Delete(":messageId/me")
    async deleteForMe(
        @Req() req,
        @Param("messageId") messageId: string,
    ) {
        const result = await this.messagesService.deleteForMe(req.user.id, messageId);

        return ApiResponseUtil.success(result, "Message deleted for you successfully");
    }

    @Delete(":messageId/everyone")
    async deleteForEveryone(
        @Req() req,
        @Param("messageId") messageId: string,
    ) {
        const result = await this.messagesService.deleteForEveryone(req.user.id, messageId);

        this.chatGateway.broadcastMessageDeleted(
            result.conversationId,
            result.id,
            result.deleteType,
        )

        return ApiResponseUtil.success(result, "Message deleted for everyone successfully");
    }

    @Post(":messageId/hide")
    async hideMessage(
        @Req() req,
        @Param("messageId") messageId: string,
    ) {
        const result = await this.messagesService.hideMessage(req.user.id, messageId);

        return ApiResponseUtil.success(result, "Message hidden successfully");
    }

    @Delete(":messageId/hide")
    async unhideMessage(
        @Req() req,
        @Param("messageId") messageId: string,
    ) {
        const result = await this.messagesService.unhideMessage(req.user.id, messageId);
        return ApiResponseUtil.success(result, "Message unhidden successfully");
    }
}
