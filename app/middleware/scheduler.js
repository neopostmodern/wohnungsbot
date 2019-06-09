// @flow

import type { Action, Dispatch, Store } from '../reducers/types';
import { navigateToFlatPage, setBotIsActing } from '../actions/electron';
import { INVESTIGATE_FLAT, SET_BOT_IS_ACTING } from '../constants/actionTypes';
import { sleep } from '../utils/async';

const queue = [];

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => async (action: Action) => {
  const run = async queuedAction => {
    store.dispatch(setBotIsActing(true, queuedAction.meta.message));

    if (action.type === INVESTIGATE_FLAT) {
      await store.dispatch(navigateToFlatPage(queuedAction.payload.flatId));
    }
  };

  if (action.type === SET_BOT_IS_ACTING && action.payload.isActing === false) {
    const nextAction = queue.pop();
    if (nextAction) {
      await sleep(10000);
      run(nextAction);
    }
  }

  if (action.meta && action.meta.queue) {
    const { isBotActing } = store.getState().electron;
    if (isBotActing) {
      queue.push(action);
    } else {
      run(action);
    }
  }

  return next(action);
};
