// @flow

import { clickAnimationClear, clickAnimationShow } from '../actions/animations';
import { uniqueId } from '../utils/random';
import type { Action, Dispatch, Store } from '../reducers/types';
import { WILL_CLICK } from '../constants/actionTypes';

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => (action: Action) => {
  if (action.type === WILL_CLICK) {
    const animationId = uniqueId();
    next(clickAnimationShow(animationId, action.payload.x, action.payload.y));
    setTimeout(() => next(clickAnimationClear(animationId)), 5000);
  }

  next(action);
};
