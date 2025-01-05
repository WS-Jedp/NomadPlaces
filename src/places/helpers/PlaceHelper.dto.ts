import { Places } from "@prisma/client";
import { PlaceMongoEntity } from "src/global/entities/place";

class PlaceEntityHelper {
    protected placeMongoEntity: PlaceMongoEntity

    public static MongoEntityToDTO(mongoEntity: PlaceMongoEntity): Places {
        return {
            id: mongoEntity._id.$oid,
            name: mongoEntity.name,
            knownFor: mongoEntity.knownFor,
            description: mongoEntity.description,
            languages: mongoEntity.languages,
            approximateDailyCost: mongoEntity.approximateDailyCost,
            themeTags: mongoEntity.themeTags,
            ambianceTags: mongoEntity.ambianceTags,
            commodities: mongoEntity.commodities,
            location: mongoEntity.location,
            multimedia: mongoEntity.multimedia,
            rules: mongoEntity.rules,
            type: mongoEntity.type,
            approvedDate: mongoEntity.approvedDate,
            confirmationStatus: mongoEntity.confirmationStatus,
            confirmedByIDs: mongoEntity.confirmedByIDs,
            discoveredByID: mongoEntity.discoveredByID,
            visitedByIDs: [],
            discoveredDate: mongoEntity.discoveredDate,
            rejectedDate: mongoEntity.rejectedDate
        }
    }
}

export {
    PlaceEntityHelper
}
