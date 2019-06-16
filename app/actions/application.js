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
import { clickAction, elementExists } from './botHelpers';
import {
  fillForm,
  generateAdditionalDataFormFillingDescription,
  generatePersonalDataFormFillingDescription
} from './formFiller';
import applicationTextBuilder from '../flat/applicationTextBuilder';
import { sendApplicationNotificationEmail } from './email';
import {
  returnToSearchPage,
  setBotIsActing,
  setBotMessage,
  setShowOverlay,
  taskFinished
} from './bot';

export const generateApplicationTextAndSubmit = (flatId: string) => async (
  dispatch: Dispatch,
  getState: GetState
) => {
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
    300000
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

  const applicationText = applicationTextBuilder(
    configuration.applicationText,
    flatOverview.address,
    flatOverview.contactDetails
  );

  await electronUtils.fillText('#contactForm-Message', applicationText);

  await dispatch(
    fillForm(
      personalDataFormFillingDescription,
      configuration.policies.fillAsLittleAsPossible
    )
  );

  await sleep(1000);

  if (!(await dispatch(elementExists('#contactForm-privacyPolicyAccepted')))) {
    dispatch(setBotMessage('Und noch eine Seite...'));

    await dispatch(clickAction('#is24-expose-modal button.button-primary'));

    await sleep(3000);

    await dispatch(
      fillForm(
        generateAdditionalDataFormFillingDescription(
          configuration.additionalInformation
        ),
        configuration.policies.fillAsLittleAsPossible
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
      sendApplicationNotificationEmail(
        configuration.contactData,
        flatOverview,
        applicationText
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
  await sleep(5000);

  // this kicks of next queued action, if any
  dispatch(setBotIsActing(false));
  dispatch(setShowOverlay(true));
};

export const discardApplicationProcess = (
  flatOverview: OverviewDataEntry
) => async (dispatch: Dispatch) => {
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
