import { IsMimeType, IsNotEmpty, IsOptional, IsString } from "class-validator";

class UpdateUserDTO {
    @IsString()
    @IsNotEmpty()
    userID: string

    @IsOptional()
    @IsMimeType()
    profilePicture: Blob
}

export {
    UpdateUserDTO
}