import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { MessageType } from "@prisma/client";

export class AttachmentReferenceDto {
    @IsString()
    @IsNotEmpty()
    id!: string;
}

export class SendMessageDto {
    @IsString()
    @IsNotEmpty()
    conversationId!: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    replyToId?: string;

    @IsOptional()
    @IsEnum(MessageType)
    type?: MessageType;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttachmentReferenceDto)
    attachments?: AttachmentReferenceDto[];
}