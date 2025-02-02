import { PlaceTypes, Location, Commodities, PlaceRules, Multimedia, AMBIENCE_TAG_ENUM, THEME_TAG_ENUM, LANGUAGE_ENUM, PLACE_APPROXIMATE_DAILY_CONST_ENUM } from '@prisma/client'
import { isArray, IsArray, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsString,  } from 'class-validator'

class DiscoveredSpotDTO {
    @IsString()
    @IsNotEmpty()
    readonly name: string

    @IsString()
    readonly knownFor?: string

    @IsString()
    readonly description?: string

    @IsNumber()
    @IsOptional()
    readonly capacity?: number

    @IsArray()
    readonly multimedia: Multimedia[]

    @IsArray()
    @IsNotEmpty()
    readonly type: PlaceTypes[]

    @IsObject()
    @IsNotEmptyObject()
    location: Location

    @IsObject()
    @IsNotEmptyObject()
    commodities: Commodities

    @IsObject()
    @IsNotEmptyObject()
    rules: PlaceRules

    @IsString()
    @IsMongoId()
    discoveredByID: string

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
    DiscoveredSpotDTO,
}
