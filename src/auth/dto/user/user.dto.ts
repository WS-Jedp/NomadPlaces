import { IsMongoId, IsNotEmpty, IsObject, IsString,  } from 'class-validator'
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
    readonly person?: Omit<PersonDTO, 'id'>

}

export {
    UserDTO,
}
