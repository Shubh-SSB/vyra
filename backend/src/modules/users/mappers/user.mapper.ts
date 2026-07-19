import { User } from '@prisma/client';
import { UserResponseDto } from '../dto/user-response.dto';

export class UserMapper {
    static toResponse(user: User): UserResponseDto {
        return {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            email: user.email ?? undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            // avatarUrl: user.avatarUrl,
        };
    }
}