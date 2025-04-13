import type {
  Action,
  Dispatch,
  GetState,
  ThunkAction
} from '../reducers/types';
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
import electronObjects from '../store/electronObjects';
import { sleep } from '../utils/async';
import { clickAction, scrollIntoViewAction } from './botHelpers';
import { calculateOverviewBoundingBoxes } from './overlay';
import ElectronUtils from '../utils/electronUtils';
import AbortionSystem from '../utils/abortionSystem';
import { entrySelector, entryTitleSelector } from '../constants/querySelectors';
import { electronRouting, setBrowserViewReady } from './electron';
import type { LoginData } from '../reducers/configuration';
import { LoginStatus } from '../reducers/configuration';
import { setConfiguration } from './configuration';
import { logger } from '../utils/tracer-logger.js';

export function queueInvestigateFlat(flatId: string): ThunkAction {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { cache } = getState();

    if (cache.applications[flatId]) {
      return;
    }

    dispatch({
      type: QUEUE_INVESTIGATE_FLAT,
      payload: {
        flatId
      }
    });
  };
}
export function popFlatFromQueue(flatId: string): Action {
  return {
    type: POP_FLAT_FROM_QUEUE,
    payload: {
      flatId
    }
  };
}
export function setBotIsActing(isActing: boolean): Action {
  return {
    type: SET_BOT_IS_ACTING,
    payload: {
      isActing
    }
  };
}
export function setBotMessage(
  message: string | null | undefined,
  timeout?: number
): Action {
  return {
    type: SET_BOT_MESSAGE,
    payload: {
      message,
      timeout
    }
  };
}
export function setShowOverlay(showOverlay: boolean): Action {
  return {
    type: SET_SHOW_OVERLAY,
    payload: {
      showOverlay
    }
  };
}
export const navigateToFlatPage =
  (flatId: string) => async (dispatch: Dispatch) => {
    logger.trace('navigateToFlatPage');
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

    if (!(await puppetView.elementExists(flatTitleSelector))) {
      logger.warn(
        `Current flat with flatTitleSelector='${flatTitleSelector}' could not be found!`
      );
      logger.warn(`url:${puppetView.getURL()}`);
      dispatch(setBotMessage(`Fehler: Wohnung ${flatId} nicht gefunden...`));
      await sleep(5000);
      return false;
    }

    /* eslint-disable no-await-in-loop */
    while (AbortionSystem.nestedFunctionsMayContinue) {
      if (!(await puppetView.elementExists(flatTitleSelector))) {
        // now the absence of the element signals the success - we're on the next page
        return true;
      }

      await dispatch(clickAction(flatTitleSelector));
      await sleep(5000);
    }
    /* eslint-enable no-await-in-loop */

    return false;
  };
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
    logger.trace(`returnToSearchPage force:${forceReload}`);
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
export function setLoginStatus(loginStatus: LoginStatus): ThunkAction {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { configuration } = getState();
    configuration.immobilienScout24.status = loginStatus;
    dispatch(setConfiguration(configuration));
  };
}
