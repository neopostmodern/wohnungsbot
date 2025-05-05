import type { Action, Dispatch, Store } from '../reducers/types';
import { sleep } from '../utils/async';
import {
  RESET_BOT,
  SET_BROWSER_VIEW_READY,
  SET_VERDICT
} from '../constants/actionTypes';
import { calculateOverviewBoundingBoxes } from '../actions/overlay';
import { getFlatData, getOverviewData, refreshVerdicts } from '../actions/data';
import { FlatAction } from '../reducers/data';
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
import electronObjects from '../store/electronObjects';
import { querySelectorsForCookiePopup } from '../constants/querySelectors';
import {
  URL_PREFIX_FLAT_LISTING,
  URL_SEARCH_PAGE,
  URL_PARAMETER_SORT_NEWEST
} from '../constants/urls';
import { CAPTCHA_HINT } from '../constants/documentTitles';
import { logger } from '../utils/tracer-logger.js';

export default (store: Store & { dispatch: Dispatch }) =>
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
        (await electronUtils.evaluate('document.title')).includes(CAPTCHA_HINT)
      ) {
        logger.info('Found a captcha...');
        await electronUtils.humanInteraction(async () => {
          return (await electronUtils.evaluate('document.title')).includes(
            CAPTCHA_HINT
          );
        });
        await sleep(500);
        logger.info('Captcha done...');
        await handlePuppetReady();
        return;
      }

      // handle cookie popup if present
      if (
        (await electronUtils.elementExists(
          querySelectorsForCookiePopup.popupRoot
        )) &&
        (await electronUtils.elementExists(
          querySelectorsForCookiePopup.popupContainer,
          querySelectorsForCookiePopup.popupRoot
        ))
      ) {
        logger.info('Found a cookie...');
        store.dispatch(setBotMessage('🍪⁉️'));
        await sleep(500);
        await electronUtils.click(
          querySelectorsForCookiePopup.cookieCustomizeButton,
          querySelectorsForCookiePopup.popupRoot
        );
        await sleep(500);
        await electronUtils.click(
          querySelectorsForCookiePopup.cookieDenyAllButton,
          querySelectorsForCookiePopup.popupRoot
        );
        await sleep(500);
        store.dispatch(setBotMessage('🍪✔️'));
        await sleep(500);
        logger.info('Cookies done...');
      }

      if (puppet.url.startsWith(URL_SEARCH_PAGE)) {
        logger.info('Finished loading search page...');
        logger.debug(`url: ${puppet.url}`);
        const {
          configuration: { experimentalFeatures }
        } = store.getState();

        if (
          experimentalFeatures.sortByNewest &&
          !puppet.url.includes(URL_PARAMETER_SORT_NEWEST)
        ) {
          store.dispatch(setBotMessage('Sortierung ändern...️'));
          setImmediate(async () => {
            await electronUtils.evaluate(
              "window.location = window.location + '&'" +
                URL_PARAMETER_SORT_NEWEST
            );
          });
          await sleep(500);
          store.dispatch(setBotMessage(null));
          await handlePuppetReady();
          return;
        }

        setImmediate(() => store.dispatch(calculateOverviewBoundingBoxes()));
        setTimeout(() => store.dispatch(calculateOverviewBoundingBoxes()), 500);
        setTimeout(
          () => store.dispatch(calculateOverviewBoundingBoxes()),
          1000
        );
        await store.dispatch(getOverviewData());
        await store.dispatch(refreshVerdicts());
        await sleep(500);
        store.dispatch(launchNextTask());
      }

      if (puppet.url.startsWith(URL_PREFIX_FLAT_LISTING)) {
        logger.info('Finished loading flat expose page...');
        logger.debug(`url: ${puppet.url}`);
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

    const result = next(action);

    if (action.type === SET_VERDICT) {
      const { flatId, verdict } = action.payload;
      const {
        configuration: { contactData },
        data: { overview }
      } = store.getState();
      const flatOverview = overview[flatId];

      // eslint-disable-next-line default-case
      switch (verdict.action) {
        case FlatAction.NOTIFY_VIEWING_DATE:
          logger.info(`Notify me for flat ${flatId}...`);
          store.dispatch(
            sendFlatViewingNotificationMail(contactData, flatOverview)
          );
          break;

        case FlatAction.INVESTIGATE:
          logger.info(`Schedule flat ${flatId} for investigation`);
          store.dispatch(queueInvestigateFlat(flatId));
          break;

        case FlatAction.APPLY:
          logger.info(`Applying for flat ${flatId}...`);
          store.dispatch(generateApplicationTextAndSubmit(flatId));
          break;

        case FlatAction.DISCARD:
          logger.info(`Discard flat ${flatId}`);
          store.dispatch(discardApplicationProcess(flatOverview));
          break;
      }
    }

    return result;
  };
