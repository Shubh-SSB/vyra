import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ApiResponseUtil } from "../../../common/utils/api-response";
import { AttachmentService } from "../services/attachment.service";
import { GetPresignedUrlDto } from "../dto/get-presigned-url.dto";
import { CompleteAttachmentDto } from "../dto/complete-attachment.dto";

@Controller("attachments")
@UseGuards(JwtAuthGuard)
export class AttachmentController {
    constructor(private readonly attachmentService: AttachmentService) {}

    @Post("presigned-url")
    async getPresignedUrl(@Body() dto: GetPresignedUrlDto) {
        const result = await this.attachmentService.generatePresignedUrl(
            dto.fileName,
            dto.contentType,
            dto.folder,
        );
        return ApiResponseUtil.success(result, "Presigned URL generated successfully");
    }

    @Post("complete")
    async completeAttachment(@Body() dto: CompleteAttachmentDto) {
        const attachment = await this.attachmentService.completeAttachment(dto);
        return ApiResponseUtil.success(attachment, "Attachment completed successfully");
    }
}
