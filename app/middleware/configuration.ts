import { setSearchUrl } from "../actions/configuration";
import { refreshVerdicts } from "../actions/data";
import type { Action, Dispatch, Store } from "../reducers/types";
import { SET_SEARCH_URL } from "../constants/actionTypes";
import { getConfigurationFilterHash } from "../reducers/configuration";
import { generateSearchUrl } from "../flat/urlBuilder"; // eslint-disable-next-line no-unused-vars

export default ((store: Store) => (next: Dispatch) => async (action: Action) => {
  if (!action.meta || !action.meta.configuration) {
    return next(action);
  }

  const filterBeforeUpdate = getConfigurationFilterHash(store.getState().configuration);
  const result = next(action);

  if (getConfigurationFilterHash(store.getState().configuration) !== filterBeforeUpdate) {
    store.dispatch(refreshVerdicts());

    if (action.type !== SET_SEARCH_URL) {
      process.nextTick(() => {
        store.dispatch(setSearchUrl(generateSearchUrl(store.getState().configuration)));
      });
    }
  }

  return result;
});