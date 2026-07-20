import {
    IsString,
    Length,
} from "class-validator";

export class SearchUserDto {

    @IsString()

    @Length(2, 50)

    query!: string;
}