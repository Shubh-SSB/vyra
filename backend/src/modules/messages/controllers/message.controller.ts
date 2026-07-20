import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ApiResponseUtil } from "../../../common/utils/api-response";
import { MessagesService } from "../services/message.service";
import { SendMessageDto } from "../dto/send-message.dto";

@Controller("messages")
@UseGuards(JwtAuthGuard)
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService,
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
}