// @flow

import type { Action, Store } from '../reducers/types';
import { sleep } from '../utils/async';
import {
  RESET_BOT,
  SET_BROWSER_VIEW_READY,
  SET_VERDICT
} from '../constants/actionTypes';
import { calculateOverviewBoundingBoxes } from '../actions/overlay';
import { getFlatData, getOverviewData, refreshVerdicts } from '../actions/data';
import { FLAT_ACTION } from '../reducers/data';
import { sendFlatViewingNotificationMail } from '../actions/email';
import { launchNextTask, queueInvestigateFlat } from '../actions/bot';
import {
  discardApplicationProcess,
  endApplicationProcess,
  generateApplicationTextAndSubmit
} from '../actions/application';
import AbortionSystem, { ABORTION_MANUAL } from '../utils/abortionSystem';

export default (store: Store) => (next: (action: Action) => void) => async (
  action: Action
) => {
  if (action.type === RESET_BOT) {
    AbortionSystem.abort(ABORTION_MANUAL);
    store.dispatch(endApplicationProcess());
  }

  if (action.type === SET_BROWSER_VIEW_READY) {
    if (action.payload.name === 'puppet' && action.payload.ready) {
      setImmediate(async () => {
        await sleep(5000);

        const { puppet } = store.getState().electron.views;
        if (puppet.url.startsWith('https://www.immobilienscout24.de/Suche')) {
          setImmediate(() => store.dispatch(calculateOverviewBoundingBoxes()));
          setTimeout(
            () => store.dispatch(calculateOverviewBoundingBoxes()),
            1000
          );
          setTimeout(
            () => store.dispatch(calculateOverviewBoundingBoxes()),
            5000
          );

          await store.dispatch(getOverviewData());
          await store.dispatch(refreshVerdicts());
          await sleep(20000);
          store.dispatch(launchNextTask());
        }

        if (puppet.url.startsWith('https://www.immobilienscout24.de/expose/')) {
          await store.dispatch(getFlatData());
          store.dispatch(refreshVerdicts());
        }
      });
    }
  }

  if (action.type === SET_VERDICT) {
    const { flatId, verdict } = action.payload;
    const {
      configuration: { contactData },
      data: { overview }
    } = store.getState();
    const flatOverview = overview[flatId];

    // eslint-disable-next-line default-case
    switch (verdict.action) {
      case FLAT_ACTION.NOTIFY_VIEWING_DATE:
        store.dispatch(
          sendFlatViewingNotificationMail(contactData, flatOverview)
        );
        break;
      case FLAT_ACTION.INVESTIGATE:
        store.dispatch(queueInvestigateFlat(flatId));
        break;
      case FLAT_ACTION.APPLY:
        store.dispatch(generateApplicationTextAndSubmit(flatId));
        break;
      case FLAT_ACTION.DISCARD:
        store.dispatch(discardApplicationProcess(flatOverview));

        break;
    }
  }

  return next(action);
};
