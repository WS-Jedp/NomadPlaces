import { SUBSCRIPTION_PLAN_ENUM, SUBSCRIPTION_STATUS_ENUM } from '@prisma/client'
import { IsArray, IsDate, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString,  } from 'class-validator'

class SubscriptionDTO {

    @IsString()
    @IsNotEmpty()
    readonly status: SUBSCRIPTION_STATUS_ENUM

    @IsString()
    @IsNotEmpty()
    readonly type: SUBSCRIPTION_PLAN_ENUM

    @IsDate()
    @IsNotEmpty()
    readonly createdDate: Date

    @IsDate()
    @IsNotEmpty()
    readonly updatedDate: Date

    @IsOptional()
    @IsObject()
    readonly user: {
        id: string
        username: string
    }
}

export {
    SubscriptionDTO,
}
