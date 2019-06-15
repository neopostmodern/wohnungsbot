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

export function clickAction(
  selector: string,
  scrollIntoViewPolicy: ScrollIntoViewPolicy = 'auto'
) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { webContents } = getState().electron.views.puppet.browserView;

    if (!webContents.isFocused()) {
      webContents.focus();
    }

    await scrollIntoViewByPolicy(webContents, selector, scrollIntoViewPolicy);

    const boundingRect = await getBoundingBox(webContents, selector);
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

export function elementExists(selector: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { webContents } = getState().electron.views.puppet.browserView;

    return new ElectronUtils(webContents).elementExists(selector);
  };
}

export function getElementValue(selector: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { webContents } = getState().electron.views.puppet.browserView;

    return webContents.executeJavaScript(
      `document.querySelector('${selector}').value`
    );
  };
}

export type ScrollIntoViewStrategy = 'start' | 'center' | 'end' | 'nearest';
// todo: scrollIntoView has to request an update of bounding boxes
export async function scrollIntoView(
  webContents: WebContents,
  selector: string,
  strategy: ScrollIntoViewStrategy = 'center',
  smooth: boolean = true
) {
  const electronUtils = new ElectronUtils(webContents);
  /* eslint-disable no-await-in-loop */
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await electronUtils.execute(
      `document.querySelector('${selector}').scrollIntoView({ behavior: ${
        smooth ? "'smooth'" : "'auto'"
      }, block: '${strategy}'})`
    );

    // there is no way to know when the smooth scroll has finished
    await sleep(2000);

    if (await isElementInViewport(webContents, selector)) {
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

    await scrollIntoView(webContents, selector, strategy, smooth);
  };
}

export type ScrollIntoViewPolicy = 'always' | 'auto' | 'none';
export async function scrollIntoViewByPolicy(
  webContents: WebContents,
  selector: string,
  scrollIntoViewPolicy?: ScrollIntoViewPolicy = 'auto',
  overrideStrategy?: ScrollIntoViewStrategy
) {
  if (scrollIntoViewPolicy === 'none') {
    return;
  }

  if (scrollIntoViewPolicy === 'always') {
    await scrollIntoView(webContents, selector, overrideStrategy || 'center');
    return;
  }

  if (!(await isElementInViewport(webContents, selector))) {
    await scrollIntoView(webContents, selector, overrideStrategy || 'nearest');
  }
}

export async function getBoundingBox(
  webContents: WebContents,
  selector: string
): Promise<ClientRect & { x: number, y: number }> {
  return (new ElectronUtils(webContents).execute(
    `JSON.parse(JSON.stringify(document.querySelector('${selector}').getBoundingClientRect()))`
    // eslint-disable-next-line flowtype/no-weak-types
  ): any);
}

export async function getViewportSize(webContents: WebContents) {
  return webContents.executeJavaScript(
    `JSON.parse(JSON.stringify({ height: window.innerHeight, width: window.innerWidth }))`
  );
}

export async function isElementInViewport(
  webContents: WebContents,
  selector: string,
  mustIncludeTop: boolean = true,
  mustIncludeBottom: boolean = false
): Promise<boolean> {
  try {
    if (!new ElectronUtils(webContents).elementExists(selector)) {
      console.log(
        `isElementInViewport(${selector}) called on non-existent element`
      );
      return false;
    }

    const elementBoundingBox = await getBoundingBox(webContents, selector);
    const viewportSize = await getViewportSize(webContents);

    if (
      (elementBoundingBox.top < 0 ||
        elementBoundingBox.top > viewportSize.height) &&
      (elementBoundingBox.bottom < 0 ||
        elementBoundingBox.bottom > viewportSize.height)
    ) {
      return false;
    }

    return (
      (!mustIncludeTop ||
        (elementBoundingBox.top > 0 &&
          elementBoundingBox.top < viewportSize.height)) &&
      (!mustIncludeBottom ||
        (elementBoundingBox.bottom > 0 &&
          elementBoundingBox.bottom < viewportSize.height))
    );
  } catch (error) {
    console.error(`isElementInViewport(${selector}) failed.`);
    return false;
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
