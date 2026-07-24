import { ProfileVisibility, MessagePrivacy, PresenceVisibility } from "@prisma/client";

export class UserResponseDto {
    id!: string;
    username!: string;
    displayName!: string;
    email?: string;
    createdAt!: Date;
    updatedAt!: Date; 
    avatarUrl?: string;
    bio?: string;
    profileVisibility?: ProfileVisibility;
    messagePrivacy?: MessagePrivacy;
    presenceVisibility?: PresenceVisibility;
    showLastSeen?: boolean;
    showReadReceipts?: boolean;
}