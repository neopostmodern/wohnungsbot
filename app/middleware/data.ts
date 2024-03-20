import { logger } from '../utils/tracer-logger.js';
import type { Action, Dispatch, Store } from '../reducers/types';
import { REFRESH_VERDICTS } from '../constants/actionTypes';
import { VerdictScope } from '../reducers/data';
import { setVerdict } from '../actions/data';
import { getConfigurationFilterHash } from '../reducers/configuration';
import { assessFlat } from '../flat/assessment';
import type { OverviewDataEntry } from '../reducers/data';

export default (store: Store) => (next: Dispatch) => async (action: Action) => {
  if (action.type === REFRESH_VERDICTS) { // this has no specific reducer. funky architecture. don't do this. same for WAKE_UP
    const {
      data: { overview, flat, verdicts },
      configuration
    } = store.getState(); // we need multiple parts of the state, thus cannot do the logic in reducers

    if (overview) {
      logger.log('OVERVIEW %j', overview)
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
    else {
      logger.log('HAVE NO OVERVIEW')
    }
  }

  return next(action);
};
