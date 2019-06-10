// @flow

import type { BrowserView, BrowserWindow } from 'electron';
import { sleep } from '../utils/async';
import { MAIN } from '../constants/targets';
import { targetedAction } from '../middleware/targetFilter';
import type { Action, Dispatch, GetState } from '../reducers/types';
import type { BrowserViewName } from '../reducers/electron';
import {
  CLICK_LOGIN,
  ELECTRON_ROUTING,
  GENERATE_APPLICATION_TEXT_AND_SUBMIT,
  HIDE_CONFIGURATION,
  INTERNAL_ADD_BROWSER_VIEW,
  NAVIGATE_TO_FLAT_PAGE,
  PERFORM_SCROLL,
  RETURN_TO_SEARCH_PAGE,
  SET_BOT_IS_ACTING,
  SET_BROWSER_VIEW_READY,
  SET_BROWSER_VIEW_URL,
  SET_BROWSER_WINDOW,
  SHOW_CONFIGURATION,
  SHOW_DEV_TOOLS,
  WILL_CLICK
} from '../constants/actionTypes';
import applicationTextBuilder from '../flat/applicationTextBuilder';

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
    const { webContents } = getState().electron.views.puppet.browserView;
    webContents.focus();
    const boundingRect = await webContents.executeJavaScript(
      `JSON.parse(JSON.stringify(document.querySelector('${selector}').getBoundingClientRect()));`
    );

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

export function type(text: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { webContents } = getState().electron.views.puppet.browserView;
    webContents.focus();

    /* eslint-disable no-await-in-loop */
    // eslint-disable-next-line no-restricted-syntax
    for (const character of text) {
      let keyCode = character;
      if (character === '\n') {
        keyCode = '\u000d';
      }

      webContents.sendInputEvent({
        type: 'keyDown',
        keyCode
      });
      await sleep(1 + Math.random() * 5);
      webContents.sendInputEvent({
        type: 'char',
        keyCode
      });

      await sleep(10 + Math.random() * 50);
      webContents.sendInputEvent({
        type: 'keyUp',
        keyCode
      });
      if (['.', '\n'].includes(character)) {
        await sleep(100 + Math.random() * 300);
      } else {
        await sleep(20 + Math.random() * 50);
      }
    }
    /* eslint-enable no-await-in-loop */
  };
}

export function scrollIntoView(
  name: BrowserViewName,
  selector: string,
  smooth: boolean = true
) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      electron: { views }
    } = getState();
    const { webContents } = views[name].browserView;

    /* eslint-disable no-await-in-loop */
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await webContents.executeJavaScript(
        `document.querySelector('${selector}').scrollIntoView({ behavior: ${
          smooth ? "'smooth'" : "'auto'"
        }, block: 'center'});`
      );

      // there is no way to know when the smooth scroll has finished
      await sleep(2000);

      // check if it actually scrolled into view, if not repeat
      const visibilityInformation = await webContents.executeJavaScript(
        `(
          () => ({ 
            elementBoundingBoxTop: document.querySelector('${selector}').getBoundingClientRect().top,
            innerHeight: window.innerHeight
          })
        )();`
      );

      if (
        visibilityInformation.elementBoundingBoxTop > 0 &&
        visibilityInformation.elementBoundingBoxTop <
          visibilityInformation.innerHeight
      ) {
        break;
      }
    }
    /* eslint-enable no-await-in-loop */
  };
}

export function willClick(x: number, y: number) {
  return {
    type: WILL_CLICK,
    payload: { x, y }
  };
}

export const clickLogin = targetedAction<void>(
  CLICK_LOGIN,
  MAIN,
  () => async (dispatch: Dispatch) => {
    await dispatch(click('#link_loginAccountLink'));
    await sleep(1000);
    await dispatch(click('#link_loginLinkInternal'));
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

// this function is _not_ intended for routing, it retro-actively adjusts the
// URL in the store to reflect the BrowserView's URL
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

export function returnToSearchPage(): Action {
  return {
    type: RETURN_TO_SEARCH_PAGE,
    payload: null
  };
}

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

export function performScroll(name: BrowserViewName, deltaY: number): Action {
  return {
    type: PERFORM_SCROLL,
    payload: {
      name,
      deltaY
    },
    meta: {
      target: MAIN
    }
  };
}

export const navigateToFlatPage = targetedAction<string>(
  NAVIGATE_TO_FLAT_PAGE,
  MAIN,
  (flatId: string) => async (dispatch: Dispatch) => {
    await dispatch(scrollIntoView('puppet', `#result-${flatId}`));
    await sleep(1000);
    await dispatch(click(`#result-${flatId} .result-list-entry__brand-title`));
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
    await dispatch(click('#is24-expose-contact-box .button-primary'));
    await sleep(2000);
    // todo: check if application is possible (e.g. premium-only)
    await dispatch(click('#contactForm-Message'));
    await sleep(1000);
    const { configuration, data } = getState();
    const flatOverview = data.overview[flatId];
    const applicationText = applicationTextBuilder(
      configuration.applicationText,
      flatOverview.address,
      flatOverview.contactDetails
    );
    await dispatch(type(applicationText));
  }
);

export function showDevTools(name: BrowserViewName): Action {
  return {
    type: SHOW_DEV_TOOLS,
    payload: {
      name
    },
    meta: {
      target: MAIN
    }
  };
}
