// @flow

import type { ApplicationData, cacheStateType } from '../reducers/cache';
import { CACHE_NAMES } from '../reducers/cache';
import type { Dispatch, GetState } from '../reducers/types';
import { markCompleted } from './cache';
import { sleep } from '../utils/async';
import type { Configuration } from '../reducers/configuration';
import type { dataStateType, OverviewDataEntry } from '../reducers/data';
import type { electronStateType } from '../reducers/electron';
import ElectronUtilsRedux from '../utils/electronUtilsRedux';
import { removeBoundingBoxesInGroup, requestPrivacyMask } from './overlay';
import BOUNDING_BOX_GROUPS from '../constants/boundingBoxGroups';
import { clickAction, elementExists } from './botHelpers';
import {
  fillForm,
  generateAdditionalDataFormFillingDescription,
  generatePersonalDataFormFillingDescription
} from './formFiller';
import applicationTextBuilder, {
  generateInPlaceDescription
} from '../flat/applicationTextBuilder';
import { sendMail } from './email';
import { flatPageUrl } from '../flat/urlBuilder';
import {
  returnToSearchPage,
  setBotIsActing,
  setBotMessage,
  taskFinished
} from './bot';

export const generateApplicationTextAndSubmit = (flatId: string) => async (
  dispatch: Dispatch,
  getState: GetState
) => {
  console.log('apply!');
  const {
    configuration,
    data,
    electron
  }: {
    configuration: Configuration,
    data: dataStateType,
    electron: electronStateType,
    cache: cacheStateType
  } = getState();

  const { webContents } = electron.views.puppet.browserView;
  const electronUtils = new ElectronUtilsRedux(webContents, dispatch);

  const flatOverview = data.overview[flatId];

  const formTimeout = setTimeout(
    async () => markComplete(false, 'Technischer Fehler (Timeout)'),
    120000
  );

  const markComplete = async (success: boolean, reason?: string) => {
    clearTimeout(formTimeout);

    await dispatch(
      markApplicationComplete({
        flatId,
        success,
        addressDescription: flatOverview.address.description,
        reason
      })
    );

    dispatch(removeBoundingBoxesInGroup(BOUNDING_BOX_GROUPS.PRIVACY_MASK));
  };

  dispatch(setBotMessage('Anfrage schreiben!'));

  await dispatch(
    clickAction(
      await electronUtils.selectorForVisibleElement('[data-qa="sendButton"]'),
      'always'
    )
  );

  /* eslint-disable no-await-in-loop */
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (
      await electronUtils.elementExists(
        '[data-qa="get-premium-membership-button"]'
      )
    ) {
      await markComplete(false, 'Bewerbung nur mit "Premium"-Account möglich');
      return;
    }

    if (await electronUtils.elementExists('#contactForm-firstName')) {
      break;
    }

    await sleep(50);
  }
  /* eslint-ensable no-await-in-loop */

  const personalDataFormFillingDescription = generatePersonalDataFormFillingDescription(
    configuration.contactData
  );

  personalDataFormFillingDescription
    .filter(field => field.protectPrivacy)
    .forEach(field => {
      dispatch(requestPrivacyMask(field.selector));
    });

  const applicationText = applicationTextBuilder(
    configuration.applicationText,
    flatOverview.address,
    flatOverview.contactDetails
  );

  await electronUtils.fillText('#contactForm-Message', applicationText);

  await dispatch(fillForm(personalDataFormFillingDescription));

  await sleep(1000);

  if (!(await dispatch(elementExists('#contactForm-privacyPolicyAccepted')))) {
    dispatch(setBotMessage('Und noch eine Seite...'));

    await dispatch(clickAction('#is24-expose-modal button.button-primary'));

    await sleep(100);

    dispatch(removeBoundingBoxesInGroup(BOUNDING_BOX_GROUPS.PRIVACY_MASK));

    await sleep(3000);

    await dispatch(
      fillForm(
        generateAdditionalDataFormFillingDescription(
          configuration.additionalInformation
        )
      )
    );

    await sleep(1000);
  }

  // todo: seems unnecessary?
  // await dispatch(clickAction('#contactForm-privacyPolicyAccepted'));

  dispatch(setBotMessage('Abschicken :)'));
  await sleep(3000);

  await dispatch(clickAction('#is24-expose-modal .button-primary'));

  await sleep(1000);

  if (configuration.policies.applicationNotificationMails) {
    dispatch(
      sendMail(
        configuration.contactData.eMail,
        '[Wohnungsbot] Der Bot hat sich für dich auf eine Wohnung beworben!',
        `Hallo ${configuration.contactData.firstName},

der Bot hat gerade eine Wohnung ${generateInPlaceDescription(
          flatOverview.address
        )} für dich angeschrieben!
      
Am besten tust du jetzt nichts. Warte erstmal ob du angeschrieben wirst für eine Besichtigung.

Dann kannst du dir hier die Wohnung anschauen: ${flatPageUrl(flatOverview.id)}
${flatOverview.title}
${flatOverview.address.description}
${flatOverview.area}m²
${flatOverview.rent}€ Kalt

Du (also der Bot) hast geschrieben:

${applicationText}

Viel Erfolg mit der Wohnung wünscht der Wohnungsbot!`
      )
    );
  }

  dispatch(setBotMessage('Fertig.'));
  await sleep(5000);
  await markComplete(true);
};

export const markApplicationComplete = (data: ApplicationData) => async (
  dispatch: Dispatch
) => {
  const { flatId } = data;
  dispatch(markCompleted(CACHE_NAMES.APPLICATIONS, flatId, data));
  dispatch(returnToSearchPage());
  dispatch(setBotMessage(null));
  dispatch(taskFinished());
  await sleep(20000);

  // this kicks of next queued action, if any
  dispatch(setBotIsActing(false));
  // todo: check how this times against re-loading the startpage
};

export const discardApplicationProcess = (
  flatOverview: OverviewDataEntry
) => async (dispatch: Dispatch) => {
  // todo: set bot message
  dispatch(setBotMessage(`Wohnung ist leider unpassend :(`));
  await sleep(5000);
  dispatch(
    markApplicationComplete({
      flatId: flatOverview.id,
      success: false,
      addressDescription: flatOverview.address.description,
      reason: 'UNSUITABLE' // this won't show up in the sidebar
    })
  );
};
