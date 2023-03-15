import { PLACE_SESSION_ACTIONS_ENUM, DAY_TIME_SECTION_ENUM, Multimedia, PlaceSessionActions, PlaceSession } from '@prisma/client'
import { IsArray, IsDate, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsString,  } from 'class-validator'

class CreatePlaceSessionDTO {
    @IsDate()
    @IsNotEmpty()
    readonly createDate: Date

    @IsDate()
    @IsNotEmpty()
    readonly endDate: Date

    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    readonly placeSessionID: string

    @IsArray()
    readonly usersIDs?: string[]

    @IsArray()
    readonly recentActivity?: Multimedia[]

    @IsArray()
    readonly actions?: PlaceSessionActions[]

    public constructor(properties: CreatePlaceSessionDTO) {
        this.createDate = properties.createDate
        this.endDate = properties.endDate
        this.placeSessionID = properties.placeSessionID
        this.usersIDs = properties.usersIDs
        this.recentActivity = properties.recentActivity
        this.actions = properties.actions
    }
}

export {
    CreatePlaceSessionDTO,
}
