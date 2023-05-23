import { IsMongoId, IsNotEmpty, IsObject, IsString,  } from 'class-validator'
import { PersonDTO } from '../person/person.dto'

class RequestUserDTO {
    @IsString()
    @IsMongoId()
    @IsNotEmpty()
    readonly id: string

    @IsString()
    @IsNotEmpty()
    readonly username: string

    @IsString()
    @IsNotEmpty()
    readonly email: string

    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    readonly personID: string

}

export {
    RequestUserDTO,
}
