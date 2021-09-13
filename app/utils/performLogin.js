import {
  returnToSearchPage,
  setBotMessage,
  setLoginStatus
} from '../actions/bot';
import { clickAction, mouseOverAction } from '../actions/botHelpers';
import { sleep } from './async';
import type { Dispatch } from '../reducers/types';
import type { Configuration } from '../reducers/configuration';
import type ElectronUtils from './electronUtils';
import { LOGINSTATUS } from '../reducers/configuration';

export default function* performLogin(
  dispatch: Dispatch,
  electronUtils: ElectronUtils,
  configuration: Configuration
) {
  dispatch(setBotMessage('Anmelden'));

  // there seems to be a problem with the captcha implementation: https://github.com/google/recaptcha/issues/269
  yield electronUtils.evaluate(`grecaptcha = undefined`);

  console.log(yield electronUtils.elementExists('.sso-login--logged-in'));
  // Check again if user is logged in
  if (!(yield electronUtils.elementExists('.sso-login--logged-in'))) {
    // Click login button
    if (yield electronUtils.elementExists('[data-tracked-link="anmelden"]')) {
      yield dispatch(clickAction('.topnavigation__overlay--account'));
      yield sleep(1000);
      yield dispatch(clickAction('[data-tracked-link="anmelden"]'));
    }

    // Wait for page to load
    yield sleep(6000);

    // Fill username
    yield electronUtils.fillText(
      '#username',
      configuration.immobilienScout24.userName
    );

    // Click continue button
    const continueButtonSelector = '#submit';
    yield dispatch(clickAction(continueButtonSelector));
    yield sleep(3000);

    // Fill password
    yield electronUtils.fillText(
      '#password',
      configuration.immobilienScout24.password
    );

    // Click login button
    const loginButtonSelector = '#loginOrRegistration';
    yield dispatch(clickAction(loginButtonSelector));

    // Check for errors
    if (yield electronUtils.elementExists('#errors_password')) {
      yield sleep(2000);
      dispatch(setLoginStatus(LOGINSTATUS.ERROR));
      throw new Error('Anmeldefehler');
      // TODO: need's some kind of error recovery.
    }

    dispatch(setLoginStatus(LOGINSTATUS.LOGGED_IN));

    dispatch(setBotMessage('Einloggen erfolgreich :)', 4000));
  } else {
    dispatch(setBotMessage('Bereits eingeloggt', 4000));
  }
  yield sleep(5000);
  dispatch(returnToSearchPage());
}
