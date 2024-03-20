import { logger } from '../utils/tracer-logger.js';
import { WAKE_UP } from '../actions/infrastructure';
import { setConfiguration } from '../actions/configuration';
import persistentStore from '../utils/persistentStore';
import type { Action, Dispatch, Store } from '../reducers/types';
import type { Configuration } from '../reducers/configuration';
import { setCache } from '../actions/cache';

export default (store: Store) => (next: Dispatch) => (action: Action) => {
  if (action.type === WAKE_UP) {
    logger.debug(action.type)
    const configuration = persistentStore.get('configuration');

    if (configuration) {
      configuration.loaded = true;
      store.dispatch(setConfiguration(configuration));
    }

    const cache = persistentStore.get('cache');

    if (cache) {
      store.dispatch(setCache(cache));
    }
    logger.debug(action.type + " DONE")
  }

  if (action.meta && 'cache' in action.meta) {
    process.nextTick(() => {
      persistentStore.set('cache', store.getState().cache); // nur .cache vom state wird gespeichert
    });
  }

  const ret = next(action);

  if (action.meta && 'configuration' in action.meta) {
    const configurationToSave = { ...store.getState().configuration }; // nur .configuration vom state wird gespeichert
    delete configurationToSave.loaded;
    persistentStore.set('configuration', configurationToSave);
  }

  return ret;
};
