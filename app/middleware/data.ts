import type { Action, Dispatch, Store } from '../reducers/types';
import { REFRESH_VERDICTS } from '../constants/actionTypes';
import { VerdictScope } from '../reducers/data';
import { setVerdict } from '../actions/data';
import { getConfigurationFilterHash } from '../reducers/configuration';
import { assessFlat } from '../flat/assessment';
import type { OverviewDataEntry } from '../reducers/data';

export default (store: Store) => (next: Dispatch) => async (action: Action) => {
  if (action.type === REFRESH_VERDICTS) {
    // currently without reducer
    const {
      data: { overview, flat, verdicts },
      configuration
    } = store.getState();

    if (overview) {
      // we need multiple parts of the state, thus cannot do the this logic in reducers [unclean]
      const configurationHash = getConfigurationFilterHash(configuration);
      Object.values(overview).forEach((entry: OverviewDataEntry) => {
        const cachedVerdict = verdicts[entry.id];
        const flatData = flat[entry.id];
        const currentScope = flatData
          ? VerdictScope.COMPLETE
          : VerdictScope.OVERVIEW;

        if (
          cachedVerdict &&
          cachedVerdict.scope === currentScope &&
          cachedVerdict.configurationHash === configurationHash
        ) {
          return;
        }

        const verdict = assessFlat(configuration, entry, flatData);
        store.dispatch(setVerdict(entry.id, verdict));
      });
    }
  }

  return next(action);
};
