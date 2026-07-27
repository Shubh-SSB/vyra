import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { AttachmentType } from "@prisma/client";

export class CompleteAttachmentDto {
    @IsEnum(AttachmentType)
    type!: AttachmentType;

    @IsString()
    @IsNotEmpty()
    mimeType!: string;

    @IsInt()
    size!: number;

    @IsString()
    @IsNotEmpty()
    storageKey!: string;

    @IsString()
    @IsNotEmpty()
    fileUrl!: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}
