import { MULTIMEDIA_TYPE_ENUM } from '@prisma/client';
import { PLACE_MINDSET_ENUM } from '../mindset/mindset.model';
import { PLACE_NOISE_LEVEL } from '../noiseLevel/noiseLevel';

export enum UPDATE_ACTIONS {
  PLACE_AMOUNT_OF_PEOPLE = 'PLACE_AMOUNT_OF_PEOPLE',
  PLACE_MINDSET = 'PLACE_MINDSET',
  PLACE_STATUS = 'PLACE_STATUS',
  PLACE_RECENT_ACTIVITY = 'PLACE_RECENT_ACTIVITY',
  RECENT_ACTIVITY = 'RECENT_ACTIVITY',
  NOISE_LEVEL = 'NOISE_LEVEL',
}

export interface UpdateActionData {
  [UPDATE_ACTIONS.PLACE_AMOUNT_OF_PEOPLE]: {
    amount: string;
    range: [number, number];
  };
  [UPDATE_ACTIONS.PLACE_MINDSET]: PLACE_MINDSET_ENUM;
  [UPDATE_ACTIONS.PLACE_STATUS]: {
    value: boolean;
    name: string;
    type: string;
  };
  [UPDATE_ACTIONS.PLACE_RECENT_ACTIVITY]: {
    url: string;
    type: MULTIMEDIA_TYPE_ENUM;
  };
  [UPDATE_ACTIONS.RECENT_ACTIVITY]: {
    url: string;
    type: MULTIMEDIA_TYPE_ENUM;
  };
  [UPDATE_ACTIONS.NOISE_LEVEL]: PLACE_NOISE_LEVEL;
}
