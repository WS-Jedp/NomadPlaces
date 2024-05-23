import { UserGamification } from '@prisma/client'
import { IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString,  } from 'class-validator'
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
    readonly firstName: string

    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    readonly personID: string

    @IsObject()
    @IsOptional()
    readonly gamification: UserGamification

}

export {
    RequestUserDTO,
}
