import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { CommonModule } from './common/common.module';
import { SessionsModule } from './modules/sessions/sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    CommonModule,
    SessionsModule
]
})
export class AppModule {}