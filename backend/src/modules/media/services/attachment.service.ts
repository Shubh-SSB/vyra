import { Injectable, BadRequestException } from "@nestjs/common";
import { AttachmentStatus, ProcessingStatus, AttachmentType } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { StorageService } from "../../../storage/storage.service";
import * as path from "path";

@Injectable()
export class AttachmentService {
    private readonly BLOCKED_EXTENSIONS = [
        '.exe', '.dll', '.bat', '.cmd', '.sh', '.bash', '.msi', '.vbs', '.jar', '.scr',
        '.com', '.pif', '.gadget', '.wsf', '.cpl', '.reg', '.bin', '.elf', '.apk',
        '.html', '.htm', '.xhtml', '.svg'
    ];

    private readonly BLOCKED_MIME_TYPES = [
        'application/x-msdownload',
        'application/x-sh',
        'application/x-bash',
        'application/x-msi',
        'text/html',
        'image/svg+xml'
    ];

    private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) {}

    private validateFile(fileName: string, contentType: string) {
        const ext = path.extname(fileName).toLowerCase();
        if (this.BLOCKED_EXTENSIONS.includes(ext)) {
            throw new BadRequestException(`File extension ${ext} is not allowed for security reasons.`);
        }

        const mime = contentType.toLowerCase().trim();
        if (this.BLOCKED_MIME_TYPES.includes(mime)) {
            throw new BadRequestException(`Mime type ${mime} is not allowed for security reasons.`);
        }
    }

    async generatePresignedUrl(fileName: string, contentType: string, folder?: string) {
        this.validateFile(fileName, contentType);
        return this.storageService.getPresignedUrl(fileName, contentType, folder);
    }

    async completeAttachment(data: {
        type: AttachmentType;
        mimeType: string;
        size: number;
        storageKey: string;
        fileUrl: string;
        metadata?: Record<string, any>;
    }) {
        const fileName = path.basename(data.storageKey);
        this.validateFile(fileName, data.mimeType);

        if (data.size > this.MAX_FILE_SIZE) {
            throw new BadRequestException(`File size exceeds the limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        }

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
