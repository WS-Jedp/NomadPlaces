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
    @IsOptional()
    readonly job?: string

    @IsArray()
    @IsOptional()
    readonly languages?: string[]

}

export {
    PersonDTO,
}
