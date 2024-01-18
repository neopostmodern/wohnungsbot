import { setSearchUrl } from '../actions/configuration';
import { refreshVerdicts } from '../actions/data';
import type { Action, Dispatch, Store } from '../reducers/types';
import { SET_SEARCH_URL } from '../constants/actionTypes';
import { getConfigurationFilterHash } from '../reducers/configuration';
import { generateSearchUrl } from '../flat/urlBuilder';

export default (store: Store & { dispatch: Dispatch }) =>
  (next: Dispatch) =>
  async (action: Action) => {
    if (!action.meta || !('configuration' in action.meta)) {
      return next(action);
    }

    const filterBeforeUpdate = getConfigurationFilterHash(
      store.getState().configuration
    );
    const result = next(action);

    if (
      getConfigurationFilterHash(store.getState().configuration) !==
      filterBeforeUpdate
    ) {
      store.dispatch(refreshVerdicts());

      if (action.type !== SET_SEARCH_URL) {
        process.nextTick(() => {
          store.dispatch(
            setSearchUrl(generateSearchUrl(store.getState().configuration))
          );
        });
      }
    }

    return result;
  };
