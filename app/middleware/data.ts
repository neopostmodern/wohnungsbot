import { logger } from '../utils/tracer-logger.js';
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
      logger.debug(`overview ids:${Object.keys(overview)}`);
      // logger.log(`full overview:${overview}`);
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

        logger.info(
          `Refresh verdict for flat ${entry.id} [scope=${currentScope}]`
        );
        const verdict = assessFlat(configuration, entry, flatData);
        store.dispatch(setVerdict(entry.id, verdict));
      });
    } else {
      logger.warn("Have no overview. Isn't this at least '{}'?");
    }
  }

  return next(action);
};
