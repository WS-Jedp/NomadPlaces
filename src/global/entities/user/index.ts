import { User } from '@prisma/client'

type UserMongoEntity = {
    _id: {
        $oid: string
    }
} & User

export {
    UserMongoEntity
}
