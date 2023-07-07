import { Multimedia, PLACE_SESSION_ACTIONS_ENUM } from "@prisma/client";
import { UpdateActionData, UPDATE_ACTIONS } from "./updateAction.model";

export interface PlaceSessionActionDataPayload {
    [PLACE_SESSION_ACTIONS_ENUM.MESSAGE]: {
        data: string,
    }
    [PLACE_SESSION_ACTIONS_ENUM.RECENT_ACTIVITY]: {
        data: Multimedia,
    }
    [PLACE_SESSION_ACTIONS_ENUM.UPDATE]: {
        data: {
            type: UPDATE_ACTIONS,
            value: UpdateActionData
        },
    }
    [PLACE_SESSION_ACTIONS_ENUM.LEAVE]: {
        data: {
            username: string
        }
    }
    [PLACE_SESSION_ACTIONS_ENUM.JOIN]: {
        data: {
            username: string
        }
    }
}
