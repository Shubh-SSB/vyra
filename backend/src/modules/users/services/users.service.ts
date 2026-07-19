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

    async findByEmail(email: string) {
        return this.userRepository.findByEmail(email);
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
        return this.userRepository.findById(id);
    }

    async findPublicById(id: string) {
        return this.userRepository.findById(id);
    }

    async search(query: string) {
        return this.userRepository.search(query);
    }

    async updateProfile(
        userId: string,
        dto: UpdateProfileDto,
    ) {
        return this.userRepository.update(userId, dto);
    }
}