import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Query,
    Req,
    UseGuards,
    Post,
    Body,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { NotificationService } from "../services/notification.service";
import { WebPushService } from "../services/web-push.service";
import { ApiResponseUtil } from "../../../common/utils/api-response";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly webPushService: WebPushService,
    ) {}

    @Get()
    async getNotifications(
        @Req() req,
        @Query("page") page?: string,
        @Query("limit") limit?: string,
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 20;

        const result = await this.notificationService.getNotifications(
            req.user.id,
            pageNum,
            limitNum,
        );

        return ApiResponseUtil.success(result, "Notifications fetched successfully");
    }

    @Get("unread-count")
    async getUnreadCount(@Req() req) {
        const result = await this.notificationService.getUnreadCount(req.user.id);
        return ApiResponseUtil.success(result, "Unread count fetched successfully");
    }

    @Patch("read-all")
    async markAllAsRead(@Req() req) {
        const result = await this.notificationService.markAllAsRead(req.user.id);
        return ApiResponseUtil.success(result, "All notifications marked as read");
    }

    @Patch("clear-conversation/:conversationId")
    async clearConversationNotifications(
        @Req() req,
        @Param("conversationId") conversationId: string,
    ) {
        const result = await this.notificationService.markConversationNotificationsAsRead(
            req.user.id,
            conversationId,
        );
        return ApiResponseUtil.success(result, "Conversation notifications cleared");
    }

    @Patch(":id/read")
    async markAsRead(@Req() req, @Param("id") id: string) {
        const result = await this.notificationService.markAsRead(req.user.id, id);
        return ApiResponseUtil.success(result, "Notification marked as read");
    }

    @Post("web-push/register")
    async registerWebPush(@Req() req, @Body() body: any) {
        const result = await this.webPushService.saveSubscription(req.user.id, body);
        return ApiResponseUtil.success(result, "Web push subscription registered successfully");
    }

    @Post("web-push/unregister")
    async unregisterWebPush(@Req() req, @Body("endpoint") endpoint: string) {
        const result = await this.webPushService.deleteSubscription(endpoint);
        return ApiResponseUtil.success(result, "Web push subscription unregistered successfully");
    }

    @Delete()
    async deleteAllNotifications(@Req() req) {
        const result = await this.notificationService.deleteAllNotifications(req.user.id);
        return ApiResponseUtil.success(result, "All notifications deleted successfully");
    }

    @Delete(":id")
    async deleteNotification(@Req() req, @Param("id") id: string) {
        const result = await this.notificationService.deleteNotification(req.user.id, id);
        return ApiResponseUtil.success(result, "Notification deleted successfully");
    }
}