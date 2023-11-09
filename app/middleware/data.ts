import type { Action, Dispatch, Store } from '../reducers/types';
import { REFRESH_VERDICTS } from '../constants/actionTypes';
import { VERDICT_SCOPE } from '../reducers/data';
import { setVerdict } from '../actions/data';
import { getConfigurationFilterHash } from '../reducers/configuration';
import { assessFlat } from '../flat/assessment';
import type { OverviewDataEntry } from '../reducers/data'; // eslint-disable-next-line no-unused-vars

export default (store: Store) => (next: Dispatch) => async (action: Action) => {
  if (action.type === REFRESH_VERDICTS) {
    const {
      data: { overview, flat, verdicts },
      configuration
    } = store.getState();

    if (overview) {
      const configurationHash = getConfigurationFilterHash(configuration);
      Object.values(overview).forEach((entry: OverviewDataEntry) => {
        const cachedVerdict = verdicts[entry.id];
        const flatData = flat[entry.id];
        const currentScope = flatData
          ? VERDICT_SCOPE.COMPLETE
          : VERDICT_SCOPE.OVERVIEW;

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
