import { PERSON_INDUSTRY } from "@prisma/client";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

class UpdatePersonDTO {
    @IsString()
    @IsNotEmpty()
    readonly id: string

    @IsString()
    @IsNotEmpty()
    readonly firstName: string
    
    @IsString()
    @IsOptional()
    readonly lastName?: string

    @IsString()
    @IsOptional()
    readonly about?: string

    @IsString()
    @IsOptional()
    readonly country?: string

    @IsArray()
    @IsOptional()
    readonly industry?: PERSON_INDUSTRY[]

    @IsArray()
    @IsOptional()
    readonly languages?: string[]
}

export {
    UpdatePersonDTO
}