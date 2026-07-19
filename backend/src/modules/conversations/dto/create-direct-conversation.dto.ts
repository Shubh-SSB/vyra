import { IsNotEmpty, IsString } from "class-validator";

export class CreateDirectConversationDto {
    @IsString()
    @IsNotEmpty()
    userId!: string;
}