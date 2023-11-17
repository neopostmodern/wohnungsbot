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
import {
  launchNextTask,
  queueInvestigateFlat,
  setBotMessage
} from '../actions/bot';
import {
  discardApplicationProcess,
  endApplicationProcess,
  generateApplicationTextAndSubmit
} from '../actions/application';
import AbortionSystem, { ABORTION_MANUAL } from '../utils/abortionSystem';
import ElectronUtilsRedux from '../utils/electronUtilsRedux';
import { electronObjects } from '../store/electronObjects';

export default (store: Store) =>
  (next: (action: Action) => void) =>
  async (action: Action) => {
    const handlePuppetReady = async () => {
      const { puppet } = store.getState().electron.views;
      const { webContents: puppetWebContents } = electronObjects.views.puppet;
      const electronUtils = new ElectronUtilsRedux(
        puppetWebContents,
        store.dispatch
      );
      await sleep(5000);

      // handle captcha if prompted
      if (
        (await electronUtils.evaluate('document.title')).includes(
          'Ich bin kein Roboter'
        )
      ) {
        await electronUtils.humanInteraction(async () => {
          return (await electronUtils.evaluate('document.title')).includes(
            'Ich bin kein Roboter'
          );
        });
        await sleep(5000);
        await handlePuppetReady();
        return;
      }

      // handle cookie popup if present
      const cookiePopupRootSelector = '#usercentrics-root';

      if (
        (await electronUtils.elementExists(cookiePopupRootSelector)) &&
        (await electronUtils.elementExists(
          '#uc-center-container',
          cookiePopupRootSelector
        ))
      ) {
        store.dispatch(setBotMessage('🍪⁉️'));
        await sleep(1000);
        await electronUtils.click(
          '[data-testid="uc-customize-button"]',
          cookiePopupRootSelector
        );
        await sleep(1000);
        await electronUtils.click(
          '[data-testid="uc-deny-all-button"]',
          cookiePopupRootSelector
        );
        await sleep(500);
        store.dispatch(setBotMessage('🍪✔️'));
        await sleep(500);
      }

      if (puppet.url.startsWith('https://www.immobilienscout24.de/Suche')) {
        const {
          configuration: { experimentalFeatures }
        } = store.getState();

        if (
          experimentalFeatures.sortByNewest &&
          !puppet.url.includes('sorting=2')
        ) {
          store.dispatch(setBotMessage('Sortierung ändern...️'));
          setImmediate(async () => {
            await electronUtils.evaluate(
              "window.location = window.location + '&sorting=2'"
            );
          });
          await sleep(2000);
          store.dispatch(setBotMessage(null));
          await handlePuppetReady();
          return;
        }

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
    };

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
