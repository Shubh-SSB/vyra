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
import { PrismaService } from "../../prisma/prisma.service";
import type { TypingPayload } from "../interfaces/typing.interface";

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
        private readonly prisma: PrismaService,
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

            // Broadcast presence: Online
            const conversations = await this.conversationRepository.findUserConversations(payload.sub);
            for (const conv of conversations) {
                this.server.to(conv.id).emit("userPresence", {
                    userId: payload.sub,
                    isOnline: true,
                    lastSeen: null,
                });
            }
        } catch {
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        const user = client.data.user;

        if (user) {
            this.socketStateService.removeUser(
                user.id,
                client,
            );

            // Check if user is still online from another socket/tab
            const isStillOnline = !!this.socketStateService.getUser(user.id);

            if (!isStillOnline) {
                // Update database and read settings
                const timestamp = new Date();
                const updatedUser = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { lastSeen: timestamp },
                    select: { showLastSeen: true, lastSeen: true }
                });

                const conversations = await this.conversationRepository.findUserConversations(user.id);
                for (const conv of conversations) {
                    this.server.to(conv.id).emit("userPresence", {
                        userId: user.id,
                        isOnline: false,
                        lastSeen: updatedUser.showLastSeen ? updatedUser.lastSeen : null,
                    });
                }
            }
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
        });

        // Broadcast to others in the room that I am online
        this.server.to(conversationId).emit("userPresence", {
            userId: user.id,
            isOnline: true,
            lastSeen: null,
        });

        // Sync presence of all other participants with the newly joined client
        const conversation = await this.conversationRepository.findById(conversationId);
        if (conversation) {
            for (const part of conversation.participants) {
                if (part.userId !== user.id) {
                    const isOtherOnline = !!this.socketStateService.getUser(part.userId);
                    client.emit("userPresence", {
                        userId: part.userId,
                        isOnline: isOtherOnline,
                        lastSeen: isOtherOnline 
                            ? null 
                            : (part.user.showLastSeen ? part.user.lastSeen : null),
                    });
                }
            }
        }

        console.log(`${user.username} joined conversation ${conversationId}`);
    }

    @SubscribeMessage("sendMessage")
    async sendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: SendMessageDto,
    ) {
       try {
        const attachmentIds = body.attachments?.map((att) => att.id);
        const message = 
       await this.messageService.sendMessage(
            client.data.user.id,
            body.conversationId,
            body.content,
            body.replyToId,
            body.type,
            attachmentIds,
        ); 

        this.server.to(body.conversationId).emit("newMessage", {
            conversationId: body.conversationId,
            message 
        });
    } catch (error: any) {
        client.emit("error", {
            message: error.message,
        })
    }
  }

  @SubscribeMessage("typingStart")
    async typingStart(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: TypingPayload,
    ) {
        const user = client.data.user;

        const isParticipant = await this.conversationRepository.isParticipant(
            body.conversationId,
            user.id,
        )

        if (!isParticipant) {
            client.emit("error", {
                message: "You are not a participant of this conversation",
            })
        
            return

        }

        this.server.to(body.conversationId).emit("userTyping", {
            conversationId: body.conversationId,
            userId: user.id,
        })
    }

    @SubscribeMessage("typingStop")
    async typingStop(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: TypingPayload,
    ) {
        const user = client.data.user;

        const isParticipant =
            await this.conversationRepository.isParticipant(
                body.conversationId,
                user.id,
            );

        if (!isParticipant) {
            client.emit("error", {
                message: "You are not a participant of this conversation",
            });

            return;
        }

        this.server.to(body.conversationId).emit("userStoppedTyping", {
            conversationId: body.conversationId,
            userId: user.id,
        });
    }

    @SubscribeMessage("leaveConversation")
    async leaveConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: TypingPayload,
    ) {
        await client.leave(body.conversationId);

        client.emit("leftConversation", {
            conversationId: body.conversationId,
        });
    }

    @SubscribeMessage("markAsRead")
    async markAsRead(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { conversationId: string },
    ) {
        const user = client.data.user;
        if (!user) return;

        const conversationId = body.conversationId;

        const isParticipant = await this.conversationRepository.isParticipant(
            conversationId,
            user.id,
        );

        if (!isParticipant) {
            client.emit("error", {
                message: "You are not a participant of this conversation",
            });
            return;
        }

        const timestamp = new Date();
        await this.conversationRepository.updateLastReadAt(conversationId, user.id, timestamp);

        // Broadcast to all online participants in this conversation
        this.server.to(conversationId).emit("messagesRead", {
            conversationId,
            userId: user.id,
            lastReadAt: timestamp,
        });
    }

    broadcastReactionUpdate(
        conversationId: string,
        messageId: string,
        reactions: any[],
    ) {
        this.server.to(conversationId).emit("messageReaction", {
            conversationId,
            messageId,
            reactions,
        });
    }

    broadcastMessageDeleted(
        conversationId: string,
        messageId: string,
        deleteType: "FOR_ME" | "FOR_EVERYONE"
    ) {
        this.server.to(conversationId).emit("messageDeleted", {
            conversationId,
            messageId,
            deleteType,
        });
    }

    @SubscribeMessage("deleteMessage")
    async deleteMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { messageId: string; deleteType: "FOR_ME" | "FOR_EVERYONE" },
    ) {
        const user = client.data.user;
        if (!user) return;

        try {
            if (body.deleteType === "FOR_EVERYONE") {
                const result = await this.messageService.deleteForEveryone(user.id, body.messageId);
                this.broadcastMessageDeleted(result.conversationId, result.id, "FOR_EVERYONE");
            } else {
                await this.messageService.deleteForMe(user.id, body.messageId);

                client.emit('messageDeleted', {
                    messageId: body.messageId,
                    deleteType: "FOR_ME",
                })
            }
        } catch (error: any) {
            client.emit("error", {
                message: error.message,
            });
        }
    }

    @SubscribeMessage("sendReaction")
    async sendReaction(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { messageId: string; reaction: string },
    ) {
        const user = client.data.user;
        if (!user) return;

        try {
            const { messageId, reaction } = body;
            const result = await this.messageService.toggleReaction(
                user.id,
                messageId,
                reaction,
            );

            this.broadcastReactionUpdate(
                result.conversationId,
                result.messageId,
                result.reactions,
            );
        } catch (error: any) {
            client.emit("error", {
                message: error.message,
            });
        }
    }

    broadcastMessageEdited(
        conversationId: string,
        message: {
            id: string;
            content: string | null;
            editedAt: Date | null;
        },
    ) {
        this.server.to(conversationId).emit("messageEdited", {
            conversationId,
            message,
        });
    }

    broadcastNewMessage(conversationId: string, message: any) {
        this.server.to(conversationId).emit("newMessage", {
            conversationId,
            message,
        });
    }
}