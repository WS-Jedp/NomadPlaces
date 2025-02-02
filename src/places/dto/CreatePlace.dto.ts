import { PlaceTypes, Location, Commodities, PlaceRules, Multimedia, AMBIENCE_TAG_ENUM, THEME_TAG_ENUM, LANGUAGE_ENUM, PLACE_APPROXIMATE_DAILY_CONST_ENUM } from '@prisma/client'
import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString,  } from 'class-validator'
class CreatePlaceDTO {
    @IsString()
    @IsNotEmpty()
    readonly name: string

    @IsString()
    readonly description?: string

    @IsOptional()
    @IsString()
    readonly knownFor?: string
    
    @IsOptional()
    @IsNumber()
    readonly capacity?: number

    @IsArray()
    readonly multimedia: Multimedia[]

    @IsArray()
    readonly type: PlaceTypes[]

    @IsObject()
    location: Location

    @IsObject()
    commodities: Commodities

    @IsObject()
    rules: PlaceRules

    @IsArray()
    @IsOptional()
    readonly ambienceTags: AMBIENCE_TAG_ENUM[]

    @IsArray()
    @IsOptional()
    readonly themeTags: THEME_TAG_ENUM[]

    @IsArray()
    @IsOptional()
    readonly languages: LANGUAGE_ENUM[]

    @IsString()
    @IsOptional()
    readonly approximateDailyCost?: PLACE_APPROXIMATE_DAILY_CONST_ENUM
}

export {
    CreatePlaceDTO,
}
