import { WAKE_UP } from '../actions/infrastructure';
import { setConfiguration } from '../actions/configuration';
import persistentStore from '../utils/persistentStore';
import type { Action, Dispatch, Store } from '../reducers/types';
import { setCache } from '../actions/cache';

export default (store: Store) => (next: Dispatch) => (action: Action) => {
  if (action.type === WAKE_UP) {
    const configuration = persistentStore.get('configuration');

    if (configuration) {
      configuration.loaded = true;
      store.dispatch(setConfiguration(configuration));
    }

    const cache = persistentStore.get('cache');

    if (cache) {
      store.dispatch(setCache(cache));
    }
  }

  if (action.meta && 'cache' in action.meta) {
    process.nextTick(() => {
      persistentStore.set('cache', store.getState().cache);
    });
  }

  const ret = next(action);

  if (action.meta && 'configuration' in action.meta) {
    const configurationToSave = { ...store.getState().configuration };
    delete configurationToSave.loaded;
    persistentStore.set('configuration', configurationToSave);
  }

  return ret;
};
