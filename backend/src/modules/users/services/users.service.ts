import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repositories';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdatePrivacyDto, UpdateProfileDto, UpdateUsernameDto } from '../dto/update-profile.dto';
import { FriendRepository } from 'src/modules/friends/repositories/friend.repository';
import { UserMapper } from '../mappers/user.mapper';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly friendRepository: FriendRepository,

    ) {}
    
    
    async findByUsername(username: string) {
        return this.userRepository.findByUsername(username);
    }

    async findUserProfile(
    viewerId: string,
    username: string,
) {

    const user =
        await this.userRepository.findByUsername(username);

    if (!user) {
        throw new NotFoundException(
            "User not found",
        );
    }

    // Owner can always view their own profile
    if (viewerId === user.id) {
        return UserMapper.toProfileResponse(user);
    }

    const relationship =
        await this.friendRepository.findRelationship(
            viewerId,
            user.id,
        );

    switch (user.profileVisibility) {

        case "PUBLIC":
            return UserMapper.toProfileResponse(user);

        case "FRIENDS_ONLY":

            if (
                relationship?.status === "ACCEPTED"
            ) {
                return UserMapper.toProfileResponse(user);
            }

            throw new ForbiddenException(
                "This profile is private.",
            );

        case "PRIVATE":
            throw new ForbiddenException(
                "This profile is private.",
            );
    }
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

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
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

    async updateUsername(
        userId: string,
        dto: UpdateUsernameDto,
    ): Promise<User> {
        const username = dto.username.trim().toLowerCase();

        const currentUser = await this.userRepository.findById(userId);

        if (!currentUser) {
            throw new NotFoundException("User not found");
        }

        if (currentUser.username === username) {
            return currentUser;
        }

        const existingUser =
            await this.userRepository.findByUsername(username);

        if (existingUser) {
            throw new ConflictException(
                "Username is already taken",
            );
        }

        return this.userRepository.update(userId, {
            username,
        });
    }

    async isUsernameAvailable(
    username: string,
    ): Promise<boolean> {

    const existingUser =
        await this.userRepository.findByUsername(
        username.trim().toLowerCase(),
        );

    return !existingUser;
    }
 
    async updatePrivacy(
        userId: string,
        dto: UpdatePrivacyDto,
        ) {

        await this.userRepository.findByIdOrThrow(userId);

        return this.userRepository.update(userId, {
            profileVisibility: dto.profileVisibility,
            messagePrivacy: dto.messagePrivacy,
            presenceVisibility: dto.presenceVisibility,
            showLastSeen: dto.showLastSeen,
            showReadReceipts: dto.showReadReceipts,
        });
        }
}