import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { ChatGateway } from "./gateways/chat.gateway";
import { SocketStateService } from "./services/socket-state.service";
import { MessagesModule } from "../modules/messages/message.module";
import { ConversationRepository } from "src/modules/conversations/repositories/conversation.repository";

@Module({
    imports: [JwtModule, MessagesModule],
    providers: [ChatGateway, SocketStateService, ConversationRepository],
    exports: [SocketStateService],
})
export class SocketModule {} 