import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { CommonModule } from './common/common.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/message.module';
import { SocketModule } from './socket/socket.module';
import { FriendsModule } from './modules/friends/friends.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),

    PrismaModule,
    AuthModule,
    UsersModule,
    CommonModule,
    SessionsModule,
    ConversationsModule,
    MessagesModule,
    SocketModule,
    FriendsModule,
    CollectionsModule,
    MediaModule,
    NotificationsModule
  ]
})
export class AppModule { }
