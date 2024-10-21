import { setBotMessage } from '../actions/bot';
import { clickAction } from '../actions/botHelpers';
import { sleep } from './async';
import {
  fillForm,
  generateAdditionalDataFormFillingDescription,
  generatePersonalDataFormFillingDescription
} from '../actions/formFiller';
import {
  querySelectorsForApplicationForm,
  composeMessageButtonSelector
} from '../constants/querySelectors';
import { PREMIUM_HINT } from '../constants/documentTitles';
import applicationTextBuilder from '../flat/applicationTextBuilder';
import { sendApplicationNotificationEmail } from '../actions/email';
import type { OverviewDataEntry } from '../reducers/data';
import type { Dispatch } from '../reducers/types';
import { LoginStatus } from '../reducers/configuration';
import type { Configuration } from '../reducers/configuration';
import type ElectronUtils from './electronUtils';
import type ElectronUtilsRedux from './electronUtilsRedux';
import AbortionSystem from './abortionSystem';

export default function* performApplication(
  dispatch: Dispatch,
  electronUtils: ElectronUtils,
  configuration: Configuration,
  flatOverview: OverviewDataEntry
) {
  dispatch(setBotMessage('Anfrage schreiben!'));
  // there seems to be a problem with the captcha implementation: https://github.com/google/recaptcha/issues/269
  yield electronUtils.evaluate(`grecaptcha = undefined`);

  //  click on button to compose a message
  if (!(yield electronUtils.elementExists(composeMessageButtonSelector))) {
    dispatch(setBotMessage('"Nachricht schreiben"-Button nicht gefunden'));
  }

  yield dispatch(
    clickAction(
      yield electronUtils.selectorForVisibleElement(
        composeMessageButtonSelector
      ),
      { scrollIntoViewPolicy: 'always' }
    )
  );

  while (true) {
    //  check if this ad is for premium users only and we're not one of the privileged bunch
    if (
      (yield electronUtils.evaluate('document.title')).includes(PREMIUM_HINT)
    ) {
      yield sleep(3000);
      throw new Error('Bewerbung nur mit "MieterPlus"-Account möglich');
    }

    // check if the form is there, e.g. the first name field
    if (
      yield electronUtils.elementExists(
        querySelectorsForApplicationForm.firstNameField
      )
    ) {
      break;
    }

    yield sleep(50);
  }

  const personalDataFormFillingDescription =
    generatePersonalDataFormFillingDescription(
      configuration.contactData,
      configuration.immobilienScout24.status === LoginStatus.LOGGED_IN
    );
  const applicationText = applicationTextBuilder(
    configuration.applicationText,
    flatOverview.address,
    flatOverview.contactDetails
  );

  if (
    !(yield electronUtils.elementExists(
      querySelectorsForApplicationForm.messageTextarea
    ))
  ) {
    dispatch(setBotMessage('"Nachricht"-Feld nicht gefunden'));
  }

  //  fill in message field
  yield (electronUtils as ElectronUtilsRedux).fillText(
    querySelectorsForApplicationForm.messageTextarea,
    applicationText
  );

  yield dispatch(
    fillForm(
      personalDataFormFillingDescription,
      configuration.policies.fillAsLittleAsPossible
    )
  );
  yield sleep(1000);

  if (
    configuration.immobilienScout24.useAccount &&
    (yield electronUtils.elementExists(
      querySelectorsForApplicationForm.moveInDate
    ))
  ) {
    yield dispatch(
      fillForm(
        generateAdditionalDataFormFillingDescription(
          configuration.additionalInformation
        ),
        configuration.policies.fillAsLittleAsPossible
      )
    );
  }

  yield dispatch(
    fillForm(
      generateAdditionalDataFormFillingDescription(
        configuration.additionalInformation
      ),
      configuration.policies.fillAsLittleAsPossible
    )
  );
  yield sleep(1000);

  dispatch(setBotMessage('Abschicken :)'));
  yield sleep(3000);

  if (
    !(yield electronUtils.elementExists(
      querySelectorsForApplicationForm.submitButton
    ))
  ) {
    dispatch(setBotMessage('"Senden"-Button nicht gefunden'));
  }

  // make sure the submit button gets clicked, if not re-try
  while (
    (
      (yield electronUtils.getInnerText(
        querySelectorsForApplicationForm.submitButton
      )) || ''
    ).includes(querySelectorsForApplicationForm.submitButtonContent) &&
    AbortionSystem.nestedFunctionsMayContinue
  ) {
    yield dispatch(
      clickAction(querySelectorsForApplicationForm.submitButton, {
        scrollIntoViewPolicy: 'always',
        elementExistenceGuaranteed: false
      })
    );
    yield sleep(1000);
  }

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

  if (
    !(yield electronUtils.elementExists(
      querySelectorsForApplicationForm.saveDataButton
    ))
  ) {
    dispatch(setBotMessage('"Nachricht speichern"-Button nicht gefunden'));
  }

  if (
    configuration.immobilienScout24.useAccount &&
    (
      (yield electronUtils.getInnerText(
        querySelectorsForApplicationForm.saveDataButton
      )) || ''
    ).includes(querySelectorsForApplicationForm.saveDataButtonContent)
  ) {
    yield dispatch(
      clickAction(querySelectorsForApplicationForm.saveDataButton, {
        scrollIntoViewPolicy: 'always',
        elementExistenceGuaranteed: false
      })
    );
  }

  yield sleep(5000);
}
