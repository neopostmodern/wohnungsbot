import {
  returnToSearchPage,
  setBotMessage,
  setLoginStatus
} from '../actions/bot';
import { clickAction } from '../actions/botHelpers';
import { sleep } from './async';
import type { Dispatch } from '../reducers/types';
import type { Configuration } from '../reducers/configuration';
import { LOGINSTATUS } from '../reducers/configuration';
import {electronRouting} from "../actions/electron";
import ElectronUtilsRedux from "./electronUtilsRedux";
import { timeout } from "./async";

export default function* performLogin(
  dispatch: Dispatch,
  electronUtils: ElectronUtilsRedux,
  configuration: Configuration
) {
  yield sleep(1000);

  // there seems to be a problem with the captcha implementation: https://github.com/google/recaptcha/issues/269
  yield electronUtils.evaluate(`grecaptcha = undefined`);

  // Check again if user is logged in
  if (!(yield electronUtils.elementExists('.topnavigation__sso-login--logged-out'))) {
    dispatch(setLoginStatus(LOGINSTATUS.LOGGED_IN));
    dispatch(setBotMessage('Bereits eingeloggt', 4000));
  } else {
    dispatch(setBotMessage('Anmelden'));
    yield dispatch(
      electronRouting('puppet', 'https://www.immobilienscout24.de/geschlossenerbereich/start.html?source=headericon')
    );

    // Wait for page to load
    yield timeout(electronUtils.awaitElementExists('#username'), 10000);

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

    yield electronUtils.humanInteraction(async () => {
      const exists = await electronUtils.elementExists('.mfa-verify');
      return exists;
    });

    dispatch(setLoginStatus(LOGINSTATUS.LOGGED_IN));

    dispatch(setBotMessage('Einloggen erfolgreich :)', 4000));
  }

  yield sleep(5000);
  dispatch(returnToSearchPage());
}
