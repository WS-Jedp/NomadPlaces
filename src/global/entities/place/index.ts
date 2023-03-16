import { Places } from '@prisma/client'

type PlaceMongoEntity = {
    _id: {
        $oid: string
    }
} & Places

export {
    PlaceMongoEntity
}
