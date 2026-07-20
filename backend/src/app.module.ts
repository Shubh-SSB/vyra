import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { CommonModule } from './common/common.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/message.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    CommonModule,
    SessionsModule,
    ConversationsModule,
    MessagesModule,
    SocketModule,
]
})
export class AppModule {}