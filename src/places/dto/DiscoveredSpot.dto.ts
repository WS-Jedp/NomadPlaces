import { PlaceTypes, Location, Commodities, PlaceRules, Multimedia } from '@prisma/client'
import { IsArray, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsString,  } from 'class-validator'

class DiscoveredSpotDTO {
    @IsString()
    @IsNotEmpty()
    readonly name: string

    @IsString()
    readonly knownFor?: string

    @IsString()
    readonly description?: string

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
}

export {
    DiscoveredSpotDTO,
}
