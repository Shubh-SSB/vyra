import { ProfileVisibility, MessagePrivacy } from "@prisma/client";

export class UserProfileResponseDto {
  id!: string;

  username!: string;

  displayName!: string;

  avatarUrl!: string | null;

  bio!: string | null;

  lastSeen?: Date | null;

  isOnline?: boolean;

  profileVisibility?: ProfileVisibility;

  messagePrivacy?: MessagePrivacy;
}