import { IsNotEmpty, IsNotEmptyObject, IsObject, IsString } from "class-validator";
import { CreatePersonDTO } from "../person/createPerson.dto";
import { CreateUserDTO } from "./createUser.dto";

export class RegisterUserDTO {
    @IsObject()
    @IsNotEmpty()
    @IsNotEmptyObject()
    readonly userData: CreateUserDTO

    @IsObject()
    @IsNotEmpty()
    @IsNotEmptyObject()
    readonly personData: CreatePersonDTO
}