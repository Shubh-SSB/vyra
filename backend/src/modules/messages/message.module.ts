import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";

import { MessagesController } from "./controllers/message.controller";
import { MessagesService } from "./services/message.service"
import { MessageRepository } from "./repositories/message.repoitory";

import { ConversationRepository } from "../conversations/repositories/conversation.repository";

@Module({
    imports: [PrismaModule],
    controllers: [MessagesController],
    providers: [
        MessagesService,
        MessageRepository,
        ConversationRepository,
    ],
    exports: [
        MessagesService,
        MessageRepository,
    ],
})
export class MessagesModule {}