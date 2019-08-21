// @flow

import type { Action, Dispatch, GetState } from '../reducers/types';
import {
  QUEUE_INVESTIGATE_FLAT,
  RETURN_TO_SEARCH_PAGE,
  SET_BOT_IS_ACTING,
  SET_BOT_MESSAGE,
  LAUNCH_NEXT_TASK,
  NOOP,
  POP_FLAT_FROM_QUEUE,
  SET_SHOW_OVERLAY,
  TASK_FINISHED,
  SCROLL_WHILE_IDLE,
  STOP_SCROLLING_WHILE_IDLE
} from '../constants/actionTypes';
import { sleep } from '../utils/async';
import { clickAction, scrollIntoViewAction } from './botHelpers';
import { calculateOverviewBoundingBoxes } from './overlay';
import ElectronUtils from '../utils/electronUtils';

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

export const clickLogin = () => async (dispatch: Dispatch) => {
  await dispatch(clickAction('#link_loginAccountLink'));
  await sleep(1000);
  await dispatch(clickAction('#link_loginLinkInternal'));
};

export const navigateToFlatPage = (flatId: string) => async (
  dispatch: Dispatch,
  getState: GetState
) => {
  await sleep(10000);
  dispatch(setBotIsActing(true));
  dispatch(setBotMessage(`Wohnung ${flatId} suchen...`));
  dispatch(setShowOverlay(false));
  await dispatch(scrollIntoViewAction('puppet', `#result-${flatId}`));
  dispatch(calculateOverviewBoundingBoxes());
  dispatch(setShowOverlay(true));
  await sleep(5000);
  dispatch(setShowOverlay(false));
  dispatch(setBotMessage(`Wohnung ${flatId} genauer anschauen!`));

  const puppetView = new ElectronUtils(
    getState().electron.views.puppet.browserView.webContents
  );

  const flatTitleSelector = `#result-${flatId} .result-list-entry__brand-title`;

  /* eslint-disable no-await-in-loop */
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!(await puppetView.elementExists(flatTitleSelector))) {
      break;
    }
    await dispatch(clickAction(flatTitleSelector));
    await sleep(5000);
  }
  /* eslint-enable no-await-in-loop */
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

export function returnToSearchPage(): Action {
  return {
    type: RETURN_TO_SEARCH_PAGE,
    payload: null
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
