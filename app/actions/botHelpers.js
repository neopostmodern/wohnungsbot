// @flow

import type { WebContents } from 'electron';
import type { Action, Dispatch, GetState } from '../reducers/types';
import { sleep } from '../utils/async';
import {
  WILL_CLICK,
  WILL_PRESS_KEY,
  WILL_TYPE
} from '../constants/actionTypes';
import type { BrowserViewName } from '../reducers/electron';
import ElectronUtils from '../utils/electronUtils';
import AbortionSystem from '../utils/abortionSystem';

export function clickAction(
  selector: string,
  {
    scrollIntoViewPolicy = 'auto',
    elementExistenceGuaranteed = true
  }: {
    scrollIntoViewPolicy: ScrollIntoViewPolicy,
    elementExistenceGuaranteed: boolean
  } = {}
) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { webContents } = getState().electron.views.puppet.browserView;

    if (!webContents.isFocused()) {
      webContents.focus();
    }

    await scrollIntoViewByPolicy(webContents, selector, {
      scrollIntoViewPolicy,
      elementExistenceGuaranteed
    });

    // reset zoom factor, just in case someone (accidentally) changed it
    // when zoomed the coordinates are returned unscaled, so clicks miss
    webContents.setZoomFactor(1.0);

    const boundingRect = await new ElectronUtils(webContents).getBoundingBox(
      selector
    );
    const x = boundingRect.x + boundingRect.width * Math.random();
    const y = boundingRect.y + boundingRect.height * Math.random();

    dispatch(willClick(x, y));

    await sleep(500);

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
    dispatch(willType(text));

    const { webContents } = getState().electron.views.puppet.browserView;

    const electronUtils = new ElectronUtils(webContents);

    if (!webContents.isFocused()) {
      webContents.focus();
    }

    /* eslint-disable no-await-in-loop */
    // eslint-disable-next-line no-restricted-syntax
    for (const character of text) {
      if (!AbortionSystem.nestedFunctionsMayContinue) {
        return;
      }

      let keyCode = character;

      if (character === '\n') {
        keyCode = '\u000d';
      }

      await electronUtils.performPressKey(keyCode);

      if (['.', '\n'].includes(character)) {
        await sleep(100 + Math.random() * 300);
      } else {
        await sleep(20 + Math.random() * 50);
      }
    }
    /* eslint-enable no-await-in-loop */
  };
}

export function pressKey(keyCode: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(willPressKey(keyCode));

    const { webContents } = getState().electron.views.puppet.browserView;

    if (!webContents.isFocused()) {
      webContents.focus();
    }

    await new ElectronUtils(webContents).performPressKey(keyCode);
  };
}

export type ScrollIntoViewStrategy = 'start' | 'center' | 'end' | 'nearest';
// todo: scrollIntoView has to request an update of bounding boxes
export async function scrollIntoView(
  webContents: WebContents,
  selector: string,
  {
    strategy = 'center',
    smooth = true,
    elementExistenceGuaranteed = true
  }: {
    strategy: ScrollIntoViewStrategy,
    smooth?: boolean,
    elementExistenceGuaranteed?: boolean
  } = {}
) {
  const electronUtils = new ElectronUtils(webContents);
  /* eslint-disable no-await-in-loop */
  while (AbortionSystem.nestedFunctionsMayContinue) {
    await electronUtils.evaluate(
      `document.querySelector('${selector}').scrollIntoView({ behavior: ${
        smooth ? "'smooth'" : "'auto'"
      }, block: '${strategy}'})`
    );

    // there is no way to know when the smooth scroll has finished
    await sleep(2000);

    if (
      !elementExistenceGuaranteed ||
      (await electronUtils.isElementInViewport(selector))
    ) {
      break;
    }
  }
  /* eslint-enable no-await-in-loop */
}
export function scrollIntoViewAction(
  name: BrowserViewName,
  selector: string,
  strategy: ScrollIntoViewStrategy = 'center',
  smooth: boolean = true
) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      electron: { views }
    } = getState();
    const { webContents } = views[name].browserView;

    await scrollIntoView(webContents, selector, { strategy, smooth });
  };
}

export type ScrollIntoViewPolicy = 'always' | 'auto' | 'none';
export async function scrollIntoViewByPolicy(
  webContents: WebContents,
  selector: string,
  {
    scrollIntoViewPolicy = 'auto',
    overrideStrategy,
    elementExistenceGuaranteed = true
  }: {
    scrollIntoViewPolicy?: ScrollIntoViewPolicy,
    overrideStrategy?: ScrollIntoViewStrategy,
    elementExistenceGuaranteed?: boolean
  } = {}
) {
  if (scrollIntoViewPolicy === 'none') {
    return;
  }

  if (scrollIntoViewPolicy === 'always') {
    await scrollIntoView(webContents, selector, {
      strategy: overrideStrategy || 'center',
      elementExistenceGuaranteed
    });
    return;
  }

  if (!(await new ElectronUtils(webContents).isElementInViewport(selector))) {
    await scrollIntoView(webContents, selector, {
      strategy: overrideStrategy || 'nearest',
      elementExistenceGuaranteed
    });
  }
}

export function willClick(x: number, y: number): Action {
  return {
    type: WILL_CLICK,
    payload: { x, y }
  };
}

export function willPressKey(keyCode: string): Action {
  return {
    type: WILL_PRESS_KEY,
    payload: { keyCode }
  };
}

export function willType(text: string): Action {
  return {
    type: WILL_TYPE,
    payload: { text }
  };
}
