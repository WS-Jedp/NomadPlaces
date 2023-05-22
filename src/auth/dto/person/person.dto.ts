import { IsArray, IsDateString, IsMongoId, IsNotEmpty, IsObject, IsString,  } from 'class-validator'

class PersonDTO {

    @IsString()
    @IsMongoId()
    readonly id: string

    @IsString()
    @IsNotEmpty()
    readonly firstName: string

    @IsString()
    readonly lastName?: string

    @IsDateString()
    readonly birthdate?: string

    @IsString()
    readonly about?: string

    @IsString()
    readonly country?: string

    @IsString()
    readonly job?: string

    @IsArray()
    readonly languages?: string[]

}

export {
    PersonDTO,
}
