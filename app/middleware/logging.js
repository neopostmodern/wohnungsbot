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
  if (action.constructor && action.constructor.name === 'AsyncFunction') {
    // eslint-disable-next-line no-console
    console.log(
      `[Async Function] ${
        action.name ||
        (action.prototype && action.prototype.name) ||
        '<anonynumous>'
      }`
    );
  } else if (!blackList.includes(action.type)) {
    if (
      action.payload &&
      JSON.stringify(action.payload).length > payloadLengthLimit
    ) {
      // eslint-disable-next-line no-console
      console.log({
        ...action,
        payload: `${JSON.stringify(action.payload).substr(
          0,
          payloadLengthLimit
        )}...`
      });
    } else {
      // eslint-disable-next-line no-console
      console.log(action);
    }
  }

  return next(action);
};
