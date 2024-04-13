import { PlaceTypes, Location, Commodities, PlaceRules, Multimedia } from '@prisma/client'
import { IsArray, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsString,  } from 'class-validator'
import { DiscoveredSpotDTO } from './DiscoveredSpot.dto'

class PlaceConfirmationSpotDTO {

    @IsString()
    @IsMongoId()
    readonly spotID: string


    @IsObject()
    @IsNotEmpty()
    readonly discoveredSpotReview: DiscoveredSpotDTO
}

export {
    PlaceConfirmationSpotDTO,
}
