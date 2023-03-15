import { PLACE_SESSION_ACTIONS_ENUM, DAY_TIME_SECTION_ENUM } from '@prisma/client'
import { IsDate, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsString,  } from 'class-validator'

class RegisterPlaceSessionActionDTO {
    @IsDate()
    @IsNotEmpty()
    readonly createdDate: Date

    @IsObject()
    @IsNotEmpty()
    @IsNotEmptyObject()
    readonly payload?: { data: any }

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
