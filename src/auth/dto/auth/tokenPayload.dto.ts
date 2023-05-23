import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class TokenPayloadDTO {
    @IsString()
    @IsMongoId()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsMongoId()
    @IsNotEmpty()
    personID: string;
}