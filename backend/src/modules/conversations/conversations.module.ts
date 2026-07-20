import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";

import { ConversationsController } from "./controllers/conversation.controller";
import { ConversationsService } from "./services/conversation.service";
import { ConversationRepository } from "./repositories/conversation.repository";

@Module({
    imports: [
        PrismaModule,
    ],
    controllers: [
        ConversationsController,
    ],
    providers: [
        ConversationsService,
        ConversationRepository,
    ],
    exports: [
        ConversationsService,
        ConversationRepository,
    ],
})
export class ConversationsModule {}