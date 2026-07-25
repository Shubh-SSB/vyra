import { Module, forwardRef } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";

import { MessagesController } from "./controllers/message.controller";
import { MessagesService } from "./services/message.service"
import { MessageRepository } from "./repositories/message.repoitory";

import { ConversationRepository } from "../conversations/repositories/conversation.repository";
import { SocketModule } from "../../socket/socket.module";

@Module({
    imports: [PrismaModule, forwardRef(() => SocketModule)],
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