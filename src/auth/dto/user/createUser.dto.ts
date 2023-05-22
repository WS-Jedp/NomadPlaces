import { OmitType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsString } from "class-validator";
import { UserDTO } from "./user.dto";

export class CreateUserDTO extends OmitType(UserDTO, ['id']) {
    @IsString()
    @IsNotEmpty()
    password: string
}