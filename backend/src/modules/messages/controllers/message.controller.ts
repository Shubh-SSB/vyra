import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Post,
    Req,
    UseGuards,
    forwardRef,
} from "@nestjs/common";

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ApiResponseUtil } from "../../../common/utils/api-response";
import { MessagesService } from "../services/message.service";
import { SendMessageDto } from "../dto/send-message.dto";
import { ChatGateway } from "../../../socket/gateways/chat.gateway";

@Controller("messages")
@UseGuards(JwtAuthGuard)
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService,
        @Inject(forwardRef(() => ChatGateway))
        private readonly chatGateway: ChatGateway,
    ) {}

    @Post()
    async sendMessage(
        @Req() req,
        @Body() dto: SendMessageDto,
    ) {
        const message =
            await this.messagesService.sendMessage(
                req.user.id,
                dto.conversationId,
                dto.content,
            );

        return ApiResponseUtil.success(
            message,
            "Message sent successfully",
        );
    }

    @Get(":conversationId")
    async getConversationMessages(
        @Req() req,
        @Param("conversationId") conversationId: string,
    ) {
        const messages =
            await this.messagesService.getConversationMessages(
                req.user.id,
                conversationId,
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
}