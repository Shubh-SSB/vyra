import { Controller, Post, Body, UseGuards, Req, Get, Param } from "@nestjs/common";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { ConversationsService } from '../services/conversation.service';
import type { RequestWithUser } from '../../../common/interfaces/request-with-user.interface';
import { CreateDirectConversationDto } from "../dto/create-direct-conversation.dto";
import { ApiResponseUtil } from "../../../common/utils/api-response";
    
@Controller("conversations")
@UseGuards(JwtAuthGuard)
export class ConversationsController {
    constructor(
        private readonly conversationsService: ConversationsService,
    ) {}

    @Post("direct")
    async createDirectConversation(
        @Req() req: RequestWithUser,
        @Body() dto: CreateDirectConversationDto,
    ) {
        const conversation =
            await this.conversationsService.createDirectConversation(
                req.user.id,
                dto.userId,
            );

        return ApiResponseUtil.success(
            conversation,
            "Conversation created successfully.",
        );
    }

    @Get()
    async getMyConversations(
        @Req() req: RequestWithUser,
    ) {
        const conversations =
            await this.conversationsService.getUserConversations(
                req.user.id,
            );

        return ApiResponseUtil.success(
            conversations,
            "Conversations fetched successfully.",
        );
    }

    @Get(":id")
    async findById(
        @Param("id") id: string,
    ) {
        const conversation =
            await this.conversationsService.findById(id);

        return ApiResponseUtil.success(
            conversation,
            "Conversation fetched successfully.",
        );
    }
}

