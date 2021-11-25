// @flow

import type { Action, Dispatch, GetState } from '../reducers/types';
import {
  QUEUE_INVESTIGATE_FLAT,
  SET_BOT_IS_ACTING,
  SET_BOT_MESSAGE,
  LAUNCH_NEXT_TASK,
  NOOP,
  POP_FLAT_FROM_QUEUE,
  SET_SHOW_OVERLAY,
  TASK_FINISHED,
  SCROLL_WHILE_IDLE,
  STOP_SCROLLING_WHILE_IDLE,
  RESET_BOT,
  LOGIN,
  LOGOUT
} from '../constants/actionTypes';
import { electronObjects } from '../store/electronObjects';
import { sleep } from '../utils/async';
import { clickAction, scrollIntoViewAction } from './botHelpers';
import { calculateOverviewBoundingBoxes } from './overlay';
import ElectronUtils from '../utils/electronUtils';
import AbortionSystem from '../utils/abortionSystem';
import { entrySelector, entryTitleSelector } from '../utils/selectors';
import { electronRouting, setBrowserViewReady } from './electron';
import type { LoginData } from '../reducers/configuration';
import { LOGINSTATUS } from '../reducers/configuration';
import { setConfiguration } from './configuration';

export function queueInvestigateFlat(flatId: string): Action {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { cache } = getState();
    if (cache.applications[flatId]) {
      return;
    }

    dispatch({
      type: QUEUE_INVESTIGATE_FLAT,
      payload: { flatId }
    });
  };
}

export function popFlatFromQueue(flatId: string): Action {
  return {
    type: POP_FLAT_FROM_QUEUE,
    payload: { flatId }
  };
}

export const navigateToFlatPage =
  (flatId: string) => async (dispatch: Dispatch) => {
    await sleep(10000);
    dispatch(setBotIsActing(true));
    dispatch(setBotMessage(`Wohnung ${flatId} suchen...`));
    dispatch(setShowOverlay(false));
    await dispatch(scrollIntoViewAction('puppet', entrySelector(flatId)));
    dispatch(calculateOverviewBoundingBoxes());
    dispatch(setShowOverlay(true));
    await sleep(5000);
    dispatch(setShowOverlay(false));
    dispatch(setBotMessage(`Wohnung ${flatId} genauer anschauen!`));

    const puppetView = new ElectronUtils(
      electronObjects.views.puppet.webContents
    );

    const flatTitleSelector = entryTitleSelector(flatId);

    /* eslint-disable no-await-in-loop */
    while (AbortionSystem.nestedFunctionsMayContinue) {
      if (!(await puppetView.elementExists(flatTitleSelector))) {
        return true;
      }
      await dispatch(clickAction(flatTitleSelector));
      await sleep(5000);
    }
    /* eslint-enable no-await-in-loop */

    return false;
  };

export function setBotIsActing(isActing: boolean): Action {
  return {
    type: SET_BOT_IS_ACTING,
    payload: { isActing }
  };
}
export function setBotMessage(message: ?string, timeout?: number): Action {
  return {
    type: SET_BOT_MESSAGE,
    payload: { message, timeout }
  };
}
export function setShowOverlay(showOverlay: boolean): Action {
  return {
    type: SET_SHOW_OVERLAY,
    payload: { showOverlay }
  };
}

export function launchNextTask(): Action {
  return {
    type: LAUNCH_NEXT_TASK,
    payload: null
  };
}

export function taskFinished(): Action {
  return {
    type: TASK_FINISHED,
    payload: null
  };
}

export function returnToSearchPage(forceReload: boolean = false) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { electron, configuration } = getState();
    if (electron.views.puppet.url === configuration.searchUrl && !forceReload) {
      return dispatch(setBrowserViewReady('puppet', true));
    }
    return dispatch(electronRouting('puppet', configuration.searchUrl));
  };
}

export function noop(): Action {
  return {
    type: NOOP,
    payload: null
  };
}

export function scrollWhileIdle(): Action {
  return {
    type: SCROLL_WHILE_IDLE,
    payload: null
  };
}

export function stopScrollingWhileIdle(): Action {
  return {
    type: STOP_SCROLLING_WHILE_IDLE,
    payload: null
  };
}

export function resetBot(): Action {
  return {
    type: RESET_BOT,
    payload: null
  };
}

export function login(immobilienScout24Data: LoginData): Action {
  return {
    type: LOGIN,
    payload: {
      immobilienScout24Data
    }
  };
}

export function logout(): Action {
  return {
    type: LOGOUT,
    payload: null
  };
}

export function setLoginStatus(loginStatus: LOGINSTATUS): Action {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { configuration } = getState();
    configuration.immobilienScout24.status = loginStatus;
    dispatch(setConfiguration(configuration));
  };
}
