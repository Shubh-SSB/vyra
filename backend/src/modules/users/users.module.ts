import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controllers';
import { UsersService } from './services/users.service';
import { UserRepository } from './repositories/user.repositories';
import { FriendsModule } from '../friends/friends.module';
import { SocketModule } from '../../socket/socket.module';

@Module({
  imports: [
    forwardRef(() => FriendsModule),
    SocketModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository]
})
export class UsersModule {}
