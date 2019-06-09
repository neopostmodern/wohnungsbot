// @flow

import type { Action, Dispatch, Store } from '../reducers/types';
import {
  REFRESH_VERDICTS,
  SET_FLAT_DATA,
  SET_OVERVIEW_DATA,
  SET_VERDICT
} from '../constants/actionTypes';
import { FLAT_ACTION, VERDICT_SCOPE } from '../reducers/data';
import { refreshVerdicts, setVerdict } from '../actions/data';
import { getConfigurationHash } from '../reducers/configuration';
import { queueInvestigateFlat } from '../actions/bot';
import {
  electronRouting,
  generateApplicationTextAndSubmit
} from '../actions/electron';
import { assessFlat } from '../flat/assessment';

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => async (action: Action) => {
  if (action.type === SET_OVERVIEW_DATA || action.type === SET_FLAT_DATA) {
    process.nextTick(() => store.dispatch(refreshVerdicts()));
  }

  if (action.type === REFRESH_VERDICTS) {
    const {
      data: { overview, flat, verdicts },
      configuration
    } = store.getState();

    if (overview) {
      const configurationHash = getConfigurationHash(configuration);

      // eslint-disable-next-line no-restricted-syntax
      for (const entry of overview) {
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
          // eslint-disable-next-line no-continue
          continue;
        }

        const verdict = assessFlat(configuration, entry, flatData);

        store.dispatch(setVerdict(entry.id, verdict));
      }
    }
  }

  if (action.type === SET_VERDICT) {
    const { flatId, verdict } = action.payload;
    const {
      cache,
      configuration: { searchUrl }
    } = store.getState();

    const returnToHomePage = () => {
      store.dispatch(electronRouting('puppet', searchUrl));
    };

    // eslint-disable-next-line default-case
    switch (verdict.action) {
      case FLAT_ACTION.NOTIFY_VIEWING_DATE:
        // todo: check against previous mails
        // todo: send mail
        break;
      case FLAT_ACTION.INVESTIGATE:
        if (!cache.applications.includes(flatId)) {
          store.dispatch(queueInvestigateFlat(flatId));
        }
        break;
      case FLAT_ACTION.APPLY:
        if (!cache.applications.includes(flatId)) {
          // todo: set bot message

          await store.dispatch(generateApplicationTextAndSubmit(flatId));

          // todo: mark bot done & return home
        }
        break;
      case FLAT_ACTION.DISCARD:
        // todo: set bot message

        returnToHomePage();
        break;
    }
  }

  return next(action);
};
