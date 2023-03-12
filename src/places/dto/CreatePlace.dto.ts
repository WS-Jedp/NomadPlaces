import { PlaceTypes, Location, Commodities, PlaceRules } from '@prisma/client'
import { IsArray, IsNotEmpty, IsObject, IsString,  } from 'class-validator'

class CreatePlaceDTO {
    @IsString()
    @IsNotEmpty()
    readonly name: string

    @IsString()
    readonly description?: string

    @IsArray()
    readonly multimedia: String[]

    @IsArray()
    readonly type: PlaceTypes[]

    @IsObject()
    location: Location

    @IsObject()
    commodities: Commodities

    @IsObject()
    rules: PlaceRules
}

export {
    CreatePlaceDTO,
}
