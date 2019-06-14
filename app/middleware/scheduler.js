// @flow

import type { Action, Dispatch, Store } from '../reducers/types';
import { LAUNCH_NEXT_TASK } from '../constants/actionTypes';
import { navigateToFlatPage, noop, popFlatFromQueue } from '../actions/bot';
import type { schedulerStateType } from '../reducers/scheduler';

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => async (action: Action) => {
  const { scheduler }: { scheduler: schedulerStateType } = store.getState();

  if (action.type === LAUNCH_NEXT_TASK) {
    if (scheduler.isActive === true) {
      console.error('Attempt to launch a second task, ignored.');
      return next(noop());
    }
    if (scheduler.queuedFlatIds.length === 0) {
      return next(noop());
    }

    const nextFlatId = scheduler.queuedFlatIds[0];
    const result = next(action);

    store.dispatch(navigateToFlatPage(nextFlatId));
    store.dispatch(popFlatFromQueue(nextFlatId));

    return result;
  }

  return next(action);
};
