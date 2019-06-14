// @flow

import type { Action, Dispatch, Store } from '../reducers/types';
import {
  CALCULATE_BOUNDING_BOX,
  CALCULATE_OVERVIEW_BOUNDING_BOXES,
  REFRESH_BOUNDING_BOXES,
  SET_BOUNDING_BOX
} from '../constants/actionTypes';

const blackList = [
  CALCULATE_OVERVIEW_BOUNDING_BOXES,
  CALCULATE_BOUNDING_BOX,
  SET_BOUNDING_BOX,
  REFRESH_BOUNDING_BOXES
];

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => (action: Action) => {
  if (!blackList.includes(action.type)) {
    if (action.payload && JSON.stringify(action.payload).length > 100) {
      console.log(
        Object.assign({}, action, {
          payload: `${JSON.stringify(action.payload).substr(0, 100)}...`
        })
      );
    } else {
      console.log(action);
    }
  }

  return next(action);
};
