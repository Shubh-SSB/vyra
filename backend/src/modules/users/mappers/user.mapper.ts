import { User } from "@prisma/client";
import { UserResponseDto } from "../dto/user-response.dto";
import { UserProfileResponseDto } from "../dto/user-profile-response.dto";

export class UserMapper {
  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      bio: user.bio ?? undefined,
      profileVisibility: user.profileVisibility,
      messagePrivacy: user.messagePrivacy,
      presenceVisibility: user.presenceVisibility,
      showLastSeen: user.showLastSeen,
      showReadReceipts: user.showReadReceipts,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toProfileResponse(
    user: User,
    isOnline?: boolean,
  ): UserProfileResponseDto {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      lastSeen: user.lastSeen,
      isOnline: isOnline,
      profileVisibility: user.profileVisibility,
      messagePrivacy: user.messagePrivacy,
    };
  }
}