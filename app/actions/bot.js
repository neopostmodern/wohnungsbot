// @flow

import type { Action, Dispatch, GetState } from '../reducers/types';
import {
  APPLY_TO_FLAT,
  CLICK_LOGIN,
  DISCARD_FLAT,
  GENERATE_APPLICATION_TEXT_AND_SUBMIT,
  INVESTIGATE_FLAT,
  MARK_APPLICATION_COMPLETE,
  NAVIGATE_TO_FLAT_PAGE,
  RETURN_TO_OVERVIEW,
  RETURN_TO_SEARCH_PAGE,
  SET_BOT_IS_ACTING
} from '../constants/actionTypes';
import { sleep } from '../utils/async';
import { targetedAction } from '../middleware/targetFilter';
import { MAIN } from '../constants/targets';
import applicationTextBuilder, {
  generateInPlaceDescription
} from '../flat/applicationTextBuilder';
import { markCompleted } from './cache';
import type { ApplicationData } from '../reducers/cache';
import { CACHE_NAMES } from '../reducers/cache';
import type { Configuration } from '../reducers/configuration';
import type { dataStateType } from '../reducers/data';
import {
  fillForm,
  generateAdditionalDataFormFillingDescription,
  generatePersonalDataFormFillingDescription
} from './formFiller';
import {
  clickAction,
  elementExists,
  fillText,
  scrollIntoViewAction
} from './botHelpers';
import BOUNDING_BOX_GROUPS from '../constants/boundingBoxGroups';
import { removeBoundingBoxesInGroup } from './overlay';
import ElectronUtils from '../utils/electronUtils';
import { flatPageUrl } from '../flat/urlBuilder';
import sendMail from '../utils/email';
import type { electronStateType } from '../reducers/electron';

export function queueInvestigateFlat(flatId: string): Action {
  return {
    type: INVESTIGATE_FLAT,
    payload: { flatId },
    meta: {
      queue: true,
      message: 'Wohnung genauer anschauen'
    }
  };
}

export function returnToOverview(): Action {
  return {
    type: RETURN_TO_OVERVIEW,
    payload: null,
    meta: {
      queue: true,
      message: 'Fertig.',
      immediate: true
    }
  };
}

// todo: recycle as non-queued action
export function applyToFlat(flatId: string): Action {
  return {
    type: APPLY_TO_FLAT,
    payload: { flatId },

    meta: {
      queue: true,
      message: 'Bewerbung schreiben!',
      immediate: true
    }
  };
}

// todo: recycle as non-queued action
export function discardFlat(): Action {
  return {
    type: DISCARD_FLAT,
    payload: null,

    meta: {
      queue: true,
      message: 'Wohnung leider unpassend :(',
      immediate: true
    }
  };
}

export const clickLogin = targetedAction<void>(
  CLICK_LOGIN,
  MAIN,
  () => async (dispatch: Dispatch) => {
    await dispatch(clickAction('#link_loginAccountLink'));
    await sleep(1000);
    await dispatch(clickAction('#link_loginLinkInternal'));
  }
);
export const navigateToFlatPage = targetedAction<string>(
  NAVIGATE_TO_FLAT_PAGE,
  MAIN,
  (flatId: string) => async (dispatch: Dispatch) => {
    await dispatch(scrollIntoViewAction('puppet', `#result-${flatId}`));
    await sleep(1000);
    await dispatch(
      clickAction(`#result-${flatId} .result-list-entry__brand-title`)
    );
  }
);

export function setBotIsActing(isActing: boolean, message?: string): Action {
  return {
    type: SET_BOT_IS_ACTING,
    payload: { isActing, message }
  };
}

export const generateApplicationTextAndSubmit = targetedAction<string>(
  GENERATE_APPLICATION_TEXT_AND_SUBMIT,
  MAIN,
  (flatId: string) => async (dispatch: Dispatch, getState: GetState) => {
    const {
      configuration,
      data,
      electron
    }: {
      configuration: Configuration,
      data: dataStateType,
      electron: electronStateType
    } = getState();

    const { webContents } = electron.views.puppet.browserView;
    const electronUtils = new ElectronUtils(webContents);

    const flatOverview = data.overview[flatId];

    const formTimeout = setTimeout(
      async () => markComplete(false, 'Technischer Fehler (Timeout)'),
      120000
    );

    const markComplete = async (success: boolean, reason?: string) => {
      clearTimeout(formTimeout);

      await dispatch(
        // $FlowFixMe - it's too generic / HOF for flow
        markApplicationComplete({
          flatId,
          success,
          addressDescription: flatOverview.address.description,
          reason
        })
      );
    };

    const applicationText = applicationTextBuilder(
      configuration.applicationText,
      flatOverview.address,
      flatOverview.contactDetails
    );

    await dispatch(
      clickAction(
        await electronUtils.selectorForVisibleElement('[data-qa="sendButton"]'),
        'always'
      )
    );
    await sleep(2000);
    if (
      await dispatch(elementExists('[data-qa="get-premium-membership-button"]'))
    ) {
      await markComplete(false, 'Bewerbung nur mit "Premium"-Account möglich');
      return;
    }

    await dispatch(fillText('#contactForm-Message', applicationText));

    await dispatch(
      fillForm(
        generatePersonalDataFormFillingDescription(configuration.contactData)
      )
    );

    await sleep(1000);

    if (
      !(await dispatch(elementExists('#contactForm-privacyPolicyAccepted')))
    ) {
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

    await sleep(1000);

    await dispatch(clickAction('#is24-expose-modal .button-primary'));

    await sleep(1000);

    dispatch(removeBoundingBoxesInGroup(BOUNDING_BOX_GROUPS.PRIVACY_MASK));

    await sendMail(
      configuration.contactData.eMail,
      '[Wohnungsbot] Der Bot hat sich für dich auf eine Wohnung beworben!',
      `Hallo ${configuration.contactData.firstName},

der Bot hat gerade eine Wohnung ${generateInPlaceDescription(
        flatOverview.address
      )} für dich angeschrieben!

Schau sie dir hier an: ${flatPageUrl(flatOverview.id)}
${flatOverview.address.description}
${flatOverview.area}m²
${flatOverview.rent}€ Kalt

Du (also der Bot) hast geschrieben:
${applicationText}

Viel Erfolg mit der Wohnung wünscht der Wohnungsbot!`
    );

    await sleep(5000);
    await markComplete(true);
  }
);

export function returnToSearchPage(): Action {
  return {
    type: RETURN_TO_SEARCH_PAGE,
    payload: null
  };
}

export const markApplicationComplete = targetedAction<ApplicationData>(
  MARK_APPLICATION_COMPLETE,
  MAIN,
  (data: ApplicationData) => async (dispatch: Dispatch) => {
    const { flatId } = data;
    dispatch(markCompleted(CACHE_NAMES.APPLICATIONS, flatId, data));
    dispatch(returnToSearchPage());
    // todo: bot messages
    await sleep(20000);

    // this kicks of next queued action, if any
    dispatch(setBotIsActing(false));
    // todo: actually, just loading the search page kicks off a lot of actions
  }
);
