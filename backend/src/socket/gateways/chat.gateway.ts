import { JwtService } from "@nestjs/jwt";
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from "@nestjs/websockets";

import { Server, Socket } from "socket.io";
import { SocketStateService } from "../services/socket-state.service";
import { ConversationRepository } from "../../modules/conversations/repositories/conversation.repository";
import { SendMessageDto } from "src/modules/messages/dto/send-message.dto";
import { MessagesService } from "src/modules/messages/services/message.service";

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class ChatGateway
    implements OnGatewayConnection, OnGatewayDisconnect

{
    constructor(
        private readonly jwtService: JwtService,
        private readonly socketStateService: SocketStateService,
        private readonly conversationRepository: ConversationRepository,
        private readonly messageService: MessagesService,
    ) {}

    
    @WebSocketServer()
    // @ts-ignore
    server: Server;

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.query.token as string;
            
            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_ACCESS_SECRET,
            });

            client.data.user = {
                id: payload.sub,
                username: payload.username,
            }

            this.socketStateService.addUser(
                payload.sub,
                client,
            )

            console.log(
                `${payload.username} connected`,
            )
        } catch {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const user = client.data.user;

        if (user) {
            this.socketStateService.removeUser(
                user.id,
            );
        }

        console.log("Disconnected");
    }

    @SubscribeMessage("joinConversation")
    async joinConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { conversationId: string },
    ) {
        const user = client.data.user;
        const conversationId = body.conversationId;

        const isParticipant = await this.conversationRepository.isParticipant(
            conversationId,
            user.id,
        );

        if (!isParticipant) {
            client.emit(
                "error",
                "You are not a participant of this conversation",
            );
            return;
        }

        await client.join(conversationId);

        client.emit("joinedConversation", {
            conversationId,
        })

        console.log(`${user.username} joined conversation ${conversationId}`);
    }

    @SubscribeMessage("sendMessage")
    async sendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: SendMessageDto,
    ) {
       try {
        const message = 
       await this.messageService.sendMessage(
            client.data.user.id,
            body.conversationId,
            body.content,
        ); 

        this.server.to(body.conversationId).emit("newMessage", {message , conversationId: body.conversationId});
    } catch (error: any) {
        client.emit("error", {
            message: error.message,
        })
    }
  }
}