import type { WebContents } from 'electron';
import type { Action, Dispatch, GetState } from '../reducers/types';
import { sleep } from '../utils/async';
import {
  WILL_CLICK,
  WILL_PRESS_KEY,
  WILL_TYPE
} from '../constants/actionTypes';
import type { BrowserViewName } from '../reducers/electron';

export function click(selector: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { webContents } = getState().electron.views.puppet.browserView;

    if (!webContents.isFocused()) {
      webContents.focus();
    }

    const boundingRect = await webContents.executeJavaScript(
      `JSON.parse(JSON.stringify(document.querySelector('${selector}').getBoundingClientRect()));`
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

async function performPressKey(webContents: WebContents, keyCode: string) {
  // const eventDescription = keyCode === 'Shift' ? { key: keyCode } : { keyCode };
  const eventDescription = { keyCode };

  webContents.sendInputEvent(
    Object.assign({}, eventDescription, {
      type: 'keyDown'
    })
  );

  if (eventDescription.keyCode) {
    await sleep(1 + Math.random() * 5);
    webContents.sendInputEvent(
      Object.assign({}, eventDescription, {
        type: 'char'
      })
    );
  }

  await sleep(10 + Math.random() * 50);
  webContents.sendInputEvent(
    Object.assign({}, eventDescription, {
      type: 'keyUp'
    })
  );
}

export function type(text: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(willType(text));

    const { webContents } = getState().electron.views.puppet.browserView;

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

      await performPressKey(webContents, keyCode);

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

    await performPressKey(webContents, keyCode);
  };
}

export function fillText(selector: string, text: string) {
  return async (dispatch: Dispatch) => {
    await dispatch(click(selector));
    await sleep(500);
    await dispatch(type(text));
  };
}

export function elementExists(selector: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { webContents } = getState().electron.views.puppet.browserView;

    return webContents.executeJavaScript(
      `document.querySelector('${selector}') !== null`
    );
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
