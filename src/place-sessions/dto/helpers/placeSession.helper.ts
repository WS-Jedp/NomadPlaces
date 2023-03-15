import { PlaceSession } from "@prisma/client"
import { CreatePlaceSessionDTO } from "../createPlaceSession.dto"

class PlaceSessionHelper {
    
    public static dtoToEntity(placeSessionDTO: CreatePlaceSessionDTO): Omit<PlaceSession, 'id'> {
        return {
            createdDate: placeSessionDTO.createDate,
            endDate: placeSessionDTO.endDate,
            placeID: placeSessionDTO.placeSessionID,
            recentActivity: placeSessionDTO.recentActivity,
            usersIDs: placeSessionDTO.usersIDs,
        }
    }
}

export {
    PlaceSessionHelper
}
