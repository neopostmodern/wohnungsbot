// @flow

import type { BrowserView, BrowserWindow } from 'electron';
import { sleep } from '../utils/async';
import { MAIN } from '../constants/targets';
import { targetedAction } from '../middleware/targetFilter';
import type { Action, Dispatch, GetState } from '../reducers/types';
import type { BrowserViewName } from '../reducers/electron';

export const WILL_CLICK = 'WILL_CLICK';
export const CLICK_LOGIN = 'CLICK_LOGIN';
export const SET_BROWSER_WINDOW = 'SET_BROWSER_WINDOW';
export const SET_BROWSER_VIEW_READY = 'SET_BROWSER_VIEW_READY';
export const SET_BROWSER_VIEW_URL = 'SET_BROWSER_VIEW_URL';
export const ELECTRON_ROUTING = 'ELECTRON_ROUTING';
export const DATA_OVERVIEW_SET = 'DATA_OVERVIEW_SET';
export const INTERNAL_ADD_BROWSER_VIEW = 'INTERNAL_ADD_BROWSER_VIEW';
export const RESIZE = 'RESIZE';

export function setWindow(window: BrowserWindow): Action {
  return {
    type: SET_BROWSER_WINDOW,
    payload: {
      window
    }
  };
}

export function addView(
  name: BrowserViewName,
  browserView: BrowserView,
  initialUrl?: string
): Action {
  return {
    type: INTERNAL_ADD_BROWSER_VIEW,
    payload: {
      name,
      browserView,
      initialUrl
    },
    meta: {
      target: 'main'
    }
  };
}

export function click(selector: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { webContents } = getState().electron.puppetView;
    webContents.focus();
    const boundingRect = await webContents.executeJavaScript(`
        JSON.parse(JSON.stringify(document.querySelector('${selector}').getBoundingClientRect()));
      `);

    const x = boundingRect.x + boundingRect.width * Math.random();
    const y = boundingRect.y + boundingRect.height * Math.random();

    dispatch(willClick(x, y));

    webContents.sendInputEvent({
      type: 'mouseDown',
      x,
      y,
      button: 'left',
      clickCount: 1
    });
    await sleep(10);
    webContents.sendInputEvent({
      type: 'mouseUp',
      x,
      y,
      button: 'left',
      clickCount: 1
    });
  };
}

export function willClick(x: number, y: number) {
  return {
    type: WILL_CLICK,
    payload: { x, y }
  };
}

export const clickLogin = targetedAction(
  CLICK_LOGIN,
  MAIN,
  next => async () => {
    await next(click('#link_loginAccountLink'));
    await sleep(100);
    await next(click('#link_loginLinkInternal'));
  }
);

export function setBrowserViewReady(
  name: BrowserViewName,
  ready: boolean
): Action {
  return {
    type: SET_BROWSER_VIEW_READY,
    payload: { name, ready }
  };
}

export function setBrowserViewUrl(name: BrowserViewName, url: string): Action {
  return {
    type: SET_BROWSER_VIEW_URL,
    payload: { name, url }
  };
}

export function electronRouting(
  name: BrowserViewName,
  targetUrl: string
): Action {
  return {
    type: ELECTRON_ROUTING,
    payload: { name, targetUrl },
    meta: {
      target: 'main'
    }
  };
}

export function dataOverviewSet(data: any): Action {
  return {
    type: DATA_OVERVIEW_SET,
    payload: { data }
  };
}

export const HIDE_CONFIGURATION = 'HIDE_CONFIGURATION';
export const SHOW_CONFIGURATION = 'SHOW_CONFIGURATION';

export function hideConfiguration(): Action {
  return {
    type: HIDE_CONFIGURATION,
    payload: null
  };
}

export function showConfiguration(): Action {
  return {
    type: SHOW_CONFIGURATION,
    payload: null
  };
}

export function resize(): Action {
  return {
    type: RESIZE,
    payload: null
  };
}
