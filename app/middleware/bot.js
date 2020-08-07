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
import { launchNextTask, queueInvestigateFlat, setBotMessage } from '../actions/bot';
import { setInteractiveMode } from '../actions/electron';
import {
  discardApplicationProcess,
  endApplicationProcess,
  generateApplicationTextAndSubmit
} from '../actions/application';
import AbortionSystem, { ABORTION_MANUAL } from '../utils/abortionSystem';
import ElectronUtils from '../utils/electronUtils';

export default (store: Store) => (next: (action: Action) => void) => async (
  action: Action
) => {
  const handlePuppetReady = async () => {
    await sleep(5000);

    const { puppet } = store.getState().electron.views;

    puppet.browserView.webContents.insertCSS(`
      #cmp-faktor-io-brand-consent-notice {
        display: none !important;
      }
    `);

    const electronUtils = new ElectronUtils(puppet.browserView.webContents);
    if ((await electronUtils.evaluate('document.title')).includes('Ich bin kein Roboter')) {
      store.dispatch(setBotMessage('Mensch! Du bist dran.'));

      if (!puppet.browserView.webContents.isFocused()) {
        puppet.browserView.webContents.focus();
      }
      store.dispatch(setInteractiveMode(true));

      while ((await electronUtils.evaluate('document.title')).includes('Ich bin kein Roboter')) {
        await sleep(1000);
      }
      store.dispatch(setBotMessage('Geschafft, ich übernehme wieder!'));
      store.dispatch(setInteractiveMode(false));

      await sleep(5000);
      await handlePuppetReady();
      return;
    }

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
  }

  if (action.type === RESET_BOT) {
    AbortionSystem.abort(ABORTION_MANUAL);
    store.dispatch(endApplicationProcess());
  }

  if (action.type === SET_BROWSER_VIEW_READY) {
    if (action.payload.name === 'puppet' && action.payload.ready) {
      setImmediate(handlePuppetReady);
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
