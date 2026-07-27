import { Injectable } from "@nestjs/common";
import { AttachmentStatus, ProcessingStatus, AttachmentType } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { StorageService } from "../../../storage/storage.service";

@Injectable()
export class AttachmentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) {}

    async generatePresignedUrl(fileName: string, contentType: string) {
        return this.storageService.getPresignedUrl(fileName, contentType);
    }

    async completeAttachment(data: {
        type: AttachmentType;
        mimeType: string;
        size: number;
        storageKey: string;
        fileUrl: string;
        metadata?: Record<string, any>;
    }) {
        return this.prisma.attachment.create({
            data: {
                type: data.type,
                mimeType: data.mimeType,
                size: data.size,
                storageKey: data.storageKey,
                fileUrl: data.fileUrl,
                status: AttachmentStatus.TEMPORARY,
                processingStatus: ProcessingStatus.READY,
                metadata: data.metadata || undefined,
            },
        });
    }
}
