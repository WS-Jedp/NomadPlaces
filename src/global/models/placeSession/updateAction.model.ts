import { PLACE_MINDSET_ENUM } from "../mindset/mindset.model";

export enum UPDATE_ACTIONS {
    PLACE_AMOUNT_OF_PEOPLE = 'PLACE_AMOUNT_OF_PEOPLE',
    PLACE_MINDSET = 'PLACE_MINDSET',
    PLACE_STATUS = 'PLACE_STATUS',
    PLACE_RECENT_ACTIVITY = 'PLACE_RECENT_ACTIVITY',
}


export interface UpdateActionData {
    [UPDATE_ACTIONS.PLACE_AMOUNT_OF_PEOPLE]: {
        amount: string,
        range: [number, number]
    },
    [UPDATE_ACTIONS.PLACE_MINDSET]: PLACE_MINDSET_ENUM,
    [UPDATE_ACTIONS.PLACE_STATUS]: {
        value: boolean,
        name: string
        type: string
    },
    [UPDATE_ACTIONS.PLACE_RECENT_ACTIVITY]: null,
  }
