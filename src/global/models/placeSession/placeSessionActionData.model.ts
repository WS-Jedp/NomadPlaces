import { Multimedia, PLACE_SESSION_ACTIONS_ENUM } from "@prisma/client";
import { PLACE_MINDSET_ENUM } from "../mindset/mindset.model";
import { UPDATE_ACTIONS } from "./updateAction.model";

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
            value: number | PLACE_MINDSET_ENUM
        },
    }
    [PLACE_SESSION_ACTIONS_ENUM.LEAVE]: null
    [PLACE_SESSION_ACTIONS_ENUM.JOIN]: null
}
