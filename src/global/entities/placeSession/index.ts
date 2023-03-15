import { PlaceSession } from '@prisma/client'

type PlaceSessionMongoEntity = {
    _id: {
        $oid: string
    }
} & PlaceSession

export {
    PlaceSessionMongoEntity
}
