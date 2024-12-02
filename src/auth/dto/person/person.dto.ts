import { GENDER_ENUM, PERSON_INDUSTRY } from '@prisma/client'
import { IsArray, IsDateString, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString,  } from 'class-validator'

class PersonDTO {

    @IsString()
    @IsMongoId()
    readonly id: string

    @IsString()
    @IsNotEmpty()
    readonly firstName: string

    @IsString()
    @IsOptional()
    readonly lastName?: string

    @IsDateString()
    @IsOptional()
    readonly birthdate?: Date

    @IsString()
    @IsOptional()
    readonly about?: string

    @IsString()
    @IsOptional()
    readonly country?: string

    @IsString()
    @IsArray()
    @IsOptional()
    readonly industry?: PERSON_INDUSTRY[]

    @IsArray()
    @IsOptional()
    readonly languages?: string[]

    @IsString()
    @IsOptional()
    readonly gender?: GENDER_ENUM

}

export {
    PersonDTO,
}
