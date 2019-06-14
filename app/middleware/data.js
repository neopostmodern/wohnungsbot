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
import { getConfigurationFilterHash } from '../reducers/configuration';
import {
  generateApplicationTextAndSubmit,
  markApplicationComplete,
  queueInvestigateFlat
} from '../actions/bot';
import { electronRouting } from '../actions/electron';
import { assessFlat } from '../flat/assessment';
import type { OverviewDataEntry } from '../reducers/data';
import { sleep } from '../utils/async';
import { generateInPlaceDescription } from '../flat/applicationTextBuilder';
import { flatPageUrl } from '../flat/urlBuilder';
import { sendMail } from '../actions/helpers';

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
      const configurationHash = getConfigurationFilterHash(configuration);

      // $FlowFixMe -- Object.values
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

  if (action.type === SET_VERDICT) {
    const { flatId, verdict } = action.payload;
    const {
      cache,
      configuration: {
        searchUrl,
        contactData,
        policies: { flatViewingNotificationMails }
      },
      data: { overview }
    } = store.getState();
    const flatOverview = overview[flatId];

    const returnToHomePage = () => {
      store.dispatch(electronRouting('puppet', searchUrl));
    };

    // eslint-disable-next-line default-case
    switch (verdict.action) {
      case FLAT_ACTION.NOTIFY_VIEWING_DATE:
        if (flatViewingNotificationMails && !cache.mail[flatId]) {
          store.dispatch(
            sendMail(
              contactData.eMail,
              '[Wohnungsbot] Öffentlicher Wohnungsbesichtigungstermin',
              `Hallo ${contactData.firstName},

der Bot hat gerade eine Wohnung ${generateInPlaceDescription(
                flatOverview.address
              )} mit einem öffentlichen Besichtigungstermin gefunden.
Er hat natürlich keine Bewerbung abgeschickt, aber du kannst hier den Termin heraussuchen: ${flatPageUrl(
                flatId
              )}

Viel Erfolg mit der Wohnung wünscht der Wohnungsbot!`
            )
          );
        }
        break;
      case FLAT_ACTION.INVESTIGATE:
        if (!cache.applications[flatId]) {
          await sleep(10000);

          store.dispatch(queueInvestigateFlat(flatId));
        }
        break;
      case FLAT_ACTION.APPLY:
        if (!cache.applications[flatId]) {
          // todo: set bot message

          await store.dispatch(generateApplicationTextAndSubmit(flatId));

          // todo: mark bot done & return home
        }
        break;
      case FLAT_ACTION.DISCARD:
        await store.dispatch(
          // $FlowFixMe - it's too generic / HOF for flow
          markApplicationComplete({
            flatId,
            success: false,
            addressDescription: flatOverview.address.description,
            reason: 'UNSUITABLE' // this won't show up in the sidebar
          })
        );
        // todo: set bot message

        returnToHomePage();
        break;
    }
  }

  return next(action);
};
