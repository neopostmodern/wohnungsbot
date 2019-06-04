// @flow

import { WAKE_UP } from '../actions/infrastructure';
import { setConfiguration } from '../actions/configuration';
import persistentStore from '../utils/persistentStore';

export default store => next => action => {
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
  }

  next(action);
};
