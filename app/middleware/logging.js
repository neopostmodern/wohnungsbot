// @flow

import type { Action, Dispatch, Store } from '../reducers/types';
import {
  CALCULATE_BOUNDING_BOX,
  CALCULATE_OVERVIEW_BOUNDING_BOXES,
  PERFORM_SCROLL,
  REFRESH_BOUNDING_BOXES,
  SET_BOUNDING_BOX
} from '../constants/actionTypes';

const blackList = [
  CALCULATE_OVERVIEW_BOUNDING_BOXES,
  CALCULATE_BOUNDING_BOX,
  SET_BOUNDING_BOX,
  REFRESH_BOUNDING_BOXES,
  PERFORM_SCROLL
];

const payloadLengthLimit = 200;

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => (action: Action) => {
  if (!blackList.includes(action.type)) {
    if (
      action.payload &&
      JSON.stringify(action.payload).length > payloadLengthLimit
    ) {
      console.log(
        Object.assign({}, action, {
          payload: `${JSON.stringify(action.payload).substr(
            0,
            payloadLengthLimit
          )}...`
        })
      );
    } else {
      console.log(action);
    }
  }

  return next(action);
};
