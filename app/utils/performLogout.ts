import {
  returnToSearchPage,
  setBotMessage,
  setLoginStatus
} from '../actions/bot';
import { clickAction } from '../actions/botHelpers';
import { electronRouting } from '../actions/electron';
import { sleep } from './async';
import type { Dispatch } from '../reducers/types';
import type ElectronUtils from './electronUtils';
import { LOGINSTATUS } from '../reducers/configuration';

export default function* performLogout(
  dispatch: Dispatch,
  electronUtils: ElectronUtils
) {
  // there seems to be a problem with the captcha implementation: https://github.com/google/recaptcha/issues/269
  yield electronUtils.evaluate(`grecaptcha = undefined`);

  // Logout
  if (
    yield electronUtils.elementExists('.topnavigation__sso-login--logged-in')
  ) {
    dispatch(setBotMessage('Abmelden'));
    yield sleep(1000);
    yield dispatch(
      electronRouting('puppet', 'https://sso.immobilienscout24.de/sso/logout')
    );
    yield sleep(3000);
  }

  dispatch(setLoginStatus(LOGINSTATUS.LOGGED_OUT));
  dispatch(returnToSearchPage());
}
