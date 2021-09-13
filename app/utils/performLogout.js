import {
  returnToSearchPage,
  setBotMessage,
  setLoginStatus,
} from '../actions/bot';
import { clickAction, mouseOverAction } from '../actions/botHelpers';
import { sleep } from './async';
import type { Dispatch } from '../reducers/types';
import type { Configuration } from '../reducers/configuration';
import type ElectronUtils from './electronUtils';
import { LOGINSTATUS } from '../reducers/configuration';

export default function* performLogout(
  dispatch: Dispatch,
  electronUtils: ElectronUtils
) {
  dispatch(setBotMessage('Abmelden'));

  // there seems to be a problem with the captcha implementation: https://github.com/google/recaptcha/issues/269
  yield electronUtils.evaluate(`grecaptcha = undefined`);

  // Logout
  if (yield electronUtils.elementExists('[data-tracked-link="abmelden"]')) {
    yield dispatch(clickAction('.topnavigation__overlay--account'));
    yield sleep(1000);
    // First try to log out in case there is a problem with previous checks so the bot doesn't hangs.
    yield dispatch(clickAction('[data-tracked-link="abmelden"]'));
    yield sleep(3000);
  }

  dispatch(setLoginStatus(LOGINSTATUS.LOGGED_OUT));

  dispatch(returnToSearchPage());
}
