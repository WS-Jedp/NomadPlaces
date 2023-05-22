import { IsMongoId, IsNotEmpty, IsObject, IsString,  } from 'class-validator'
import { PersonDTO } from '../person/person.dto'

class RequestUserDTO {
    @IsString()
    @IsMongoId()
    readonly id: string

    @IsString()
    @IsNotEmpty()
    readonly username: string

}

export {
    RequestUserDTO,
}
