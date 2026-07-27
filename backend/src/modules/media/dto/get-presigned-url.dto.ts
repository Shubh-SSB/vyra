import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GetPresignedUrlDto {
    @IsString()
    @IsNotEmpty()
    fileName!: string;

    @IsString()
    @IsNotEmpty()
    contentType!: string;

    @IsString()
    @IsOptional()
    folder?: string;
}
