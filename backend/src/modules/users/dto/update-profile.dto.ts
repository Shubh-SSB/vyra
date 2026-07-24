import {
  IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    Length,
    MaxLength,
} from "class-validator";
import {
  ProfileVisibility,
  MessagePrivacy,
  PresenceVisibility,
} from "@prisma/client";


export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    displayName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    bio?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsEmail()
    email?: string;
}

export class UpdateUsernameDto {
    @IsString()
    @Length(3, 30)
    username!: string;
}
    
export class UpdatePrivacyDto {
  @IsEnum(ProfileVisibility)
  profileVisibility!: ProfileVisibility;

  @IsEnum(MessagePrivacy)
  messagePrivacy!: MessagePrivacy;

  @IsEnum(PresenceVisibility)
  presenceVisibility!: PresenceVisibility;

  @IsBoolean()
  showLastSeen!: boolean;

  @IsBoolean()
  showReadReceipts!: boolean;
}