import { Places } from "@prisma/client";
import { PlaceMongoEntity } from "src/global/entities/place";

class PlaceEntityHelper {
    protected placeMongoEntity: PlaceMongoEntity

    public static MongoEntityToDTO(mongoEntity: PlaceMongoEntity): Places {
        return {
            id: mongoEntity._id.$oid,
            commodities: mongoEntity.commodities,
            description: mongoEntity.description,
            location: mongoEntity.location,
            multimedia: mongoEntity.multimedia,
            name: mongoEntity.name,
            rules: mongoEntity.rules,
            type: mongoEntity.type
        }
    }
}

export {
    PlaceEntityHelper
}
