import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_.]+$/, {
    message:
      'Username may contain only letters, numbers, underscores and periods.',
  })
  username: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;
}