import { PLACE_SESSION_ACTIONS_ENUM, DAY_TIME_SECTION_ENUM } from '@prisma/client'
import { IsDate, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsString,  } from 'class-validator'
import { PlaceSessionActionDataPayload } from '../../global/models/placeSession/placeSessionActionData.model'


type PlaceSesssionActionPayload = PlaceSessionActionDataPayload['MESSAGE'] | PlaceSessionActionDataPayload['UPDATE'] | PlaceSessionActionDataPayload['RECENT_ACTIVITY']
class RegisterPlaceSessionActionDTO {
    @IsDate()
    @IsNotEmpty()
    readonly createdDate: Date

    @IsObject()
    @IsNotEmpty()
    @IsNotEmptyObject()
    readonly payload?: PlaceSesssionActionPayload

    @IsString()
    @IsNotEmpty()
    readonly type: PLACE_SESSION_ACTIONS_ENUM

    @IsString()
    @IsNotEmpty()
    readonly dayTimeSection: DAY_TIME_SECTION_ENUM

    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    readonly userID: string

    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    readonly placeSessionID: string
}

export {
    RegisterPlaceSessionActionDTO,
}
