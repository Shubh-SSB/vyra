import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { AttachmentController } from "./controllers/attachment.controller";
import { AttachmentService } from "./services/attachment.service";
import { StorageService } from "../../storage/storage.service";

@Module({
    imports: [PrismaModule],
    controllers: [AttachmentController],
    providers: [AttachmentService, StorageService],
    exports: [AttachmentService, StorageService],
})
export class MediaModule {}
