// @flow

import { WAKE_UP } from '../actions/infrastructure';
import { setCache } from '../actions/cache';
import persistentStore from '../utils/persistentStore';
import type { Action, Dispatch, Store } from '../reducers/types';

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => (action: Action) => {
  if (action.type === WAKE_UP) {
    const cache = persistentStore.get('cache');
    store.dispatch(setCache(cache));
  }

  if (action.meta && action.meta.cache) {
    process.nextTick(() => {
      persistentStore.set('cache', store.getState().cache);
    });
  }

  return next(action);
};
