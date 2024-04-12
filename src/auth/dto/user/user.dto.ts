import { IsArray, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString,  } from 'class-validator'
import { PersonDTO } from '../person/person.dto'

class UserDTO {
    @IsString()
    @IsMongoId()
    readonly id: string

    @IsString()
    @IsNotEmpty()
    readonly username: string

    @IsString()
    @IsNotEmpty()
    readonly email: string

    @IsString()
    @IsNotEmpty()
    readonly profilePicture: string

    @IsObject()
    @IsOptional()
    readonly person?: Omit<PersonDTO, 'id'>

    @IsArray()
    @IsOptional()
    readonly followers?: string[]

    @IsArray()
    @IsOptional()
    readonly following?: string[]

}

export {
    UserDTO,
}
