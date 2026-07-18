import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controllers'
import { UsersService } from './services/users.service'
import { UserRepository } from './repositories/user.repositories'

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository]
})
export class UsersModule {}
