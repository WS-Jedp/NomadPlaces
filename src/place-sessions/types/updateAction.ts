import {
  UpdateActionData,
  UPDATE_ACTIONS,
} from 'src/global/models/placeSession/updateAction.model';

export interface UpdateAction {
  type: UPDATE_ACTIONS;
  data: UpdateActionData;
}
