import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repositories';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
    ) {}
    
    
    async findByUsername(username: string) {
        return this.userRepository.findByUsername(username);
    }

    async findPublicByUsername(username: string) {
        return this.userRepository.findPublicByUsername(username);
    }

    async createUser(data: CreateUserDto) {
        return this.userRepository.create(data);
    }

    async findByUsernameOrEmail(usernameOrEmail: string) {
        const userByUsername = await this.userRepository.findByUsername(usernameOrEmail);

        if (userByUsername) {
            return userByUsername;
        }

        return this.userRepository.findByEmail(usernameOrEmail);
    }

    async findById(id: string) {
        return this.userRepository.findPublicById(id);
    }

    async findPublicById(id: string) {
        return this.userRepository.findPublicById(id);
    }

    async search(
        currentUserId: string,
        query: string,
    ) {

        return this.userRepository.search(
            currentUserId,
            query.trim(),
        );
}

    async updateProfile(
        userId: string,
        dto: UpdateProfileDto,
    ) {
        return this.userRepository.update(userId, dto);
    }
}