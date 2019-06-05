// @flow

import { WAKE_UP } from '../actions/infrastructure';
import { setConfiguration } from '../actions/configuration';
import persistentStore from '../utils/persistentStore';
import { refreshVerdicts } from '../actions/data';
import type { Action, Dispatch, Store } from '../reducers/types';

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => (action: Action) => {
  if (action.type === WAKE_UP) {
    const configuration = persistentStore.get('configuration');
    configuration.loaded = true;
    next(setConfiguration(configuration));
  }

  if (action.meta && action.meta.configuration) {
    process.nextTick(() => {
      const configuration = Object.assign({}, store.getState().configuration);
      delete configuration.loaded;
      persistentStore.set('configuration', configuration);
    });

    store.dispatch(refreshVerdicts());
  }

  next(action);
};
