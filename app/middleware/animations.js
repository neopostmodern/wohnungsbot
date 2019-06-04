// @flow

import { WILL_CLICK } from '../actions/electron';
import { clickAnimationClear, clickAnimationShow } from '../actions/animations';
import { uniqueId } from '../utils/random';

export default store => next => action => {
  if (action.type === WILL_CLICK) {
    const animationId = uniqueId();
    next(clickAnimationShow(animationId, action.payload.x, action.payload.y));
    setTimeout(() => next(clickAnimationClear(animationId)), 5000);
  }

  next(action);
};
