import { IsMimeType, IsNotEmpty, IsOptional, IsString } from "class-validator";

class UpdateUserDTO {
    @IsString()
    @IsNotEmpty()
    userID: string
}

export {
    UpdateUserDTO
}