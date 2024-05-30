import { UpdateAction } from "src/place-sessions/types/updateAction"

export interface SessionUpdateActionsDTO {
    readonly sessionID: string
    readonly actions: UpdateAction[]

}