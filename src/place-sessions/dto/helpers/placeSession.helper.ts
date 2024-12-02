import { PlaceSession } from "@prisma/client"
import { CreatePlaceSessionDTO } from "../createPlaceSession.dto"

class PlaceSessionHelper {
    
    public static dtoToEntity(placeSessionDTO: CreatePlaceSessionDTO): Omit<PlaceSession, 'id'> {
        return {
            createdDate: placeSessionDTO.createDate,
            endDate: placeSessionDTO.endDate,
            placeID: placeSessionDTO.placeID,
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
