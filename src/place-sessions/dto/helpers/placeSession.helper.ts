import { PlaceSession, PlaceSessionActions, PLACE_SESSION_ACTIONS_ENUM, User } from "@prisma/client"
import { Session } from "inspector"
import { CreatePlaceSessionDTO } from "../createPlaceSession.dto"
import { PlaceSessionCachedDataDTO } from "../placeSessionCachedData.dto"

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

    // public static toCachedSession(session: PlaceSession, users: User[], actions: PlaceSessionActions[]): PlaceSessionCachedDataDTO {
    //     const mindsetActions = actions.filter(action => action.type === 'UPDATE' && JSON.parse(action.payload.toString()).type === )
    //     return {
    //         id: session.id,
    //         amountOfPeople: session.usersIDs.length,
    //         placeID: session.placeID,
    //         bestMindsetTo: 
            
    //     }
    // }
}

export {
    PlaceSessionHelper
}
