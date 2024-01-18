import type { WebContents } from 'electron';
import type { Action, Dispatch, ThunkAction } from '../reducers/types';
import { sleep } from '../utils/async';
import {
  WILL_CLICK,
  WILL_PRESS_KEY,
  WILL_TYPE
} from '../constants/actionTypes';
import type { BrowserViewName } from '../reducers/electron';
import electronObjects from '../store/electronObjects';
import ElectronUtils from '../utils/electronUtils';
import AbortionSystem from '../utils/abortionSystem';

export type ScrollIntoViewPolicy = 'always' | 'auto' | 'none';
export type ScrollIntoViewStrategy = 'start' | 'center' | 'end' | 'nearest';

export function willClick(x: number, y: number): Action {
  return {
    type: WILL_CLICK,
    payload: {
      x,
      y
    }
  };
}

export function willPressKey(keyCode: string): Action {
  return {
    type: WILL_PRESS_KEY,
    payload: {
      keyCode
    }
  };
}

export function willType(text: string): Action {
  return {
    type: WILL_TYPE,
    payload: {
      text
    }
  };
}

// todo: scrollIntoView has to request an update of bounding boxes
export async function scrollIntoView(
  webContents: WebContents,
  selector: string,
  {
    strategy,
    smooth,
    elementExistenceGuaranteed,
    shadowRootSelector
  }: {
    strategy: ScrollIntoViewStrategy;
    smooth?: boolean;
    elementExistenceGuaranteed?: boolean;
    shadowRootSelector?: string;
  } = {
    strategy: 'center',
    smooth: true,
    elementExistenceGuaranteed: true,
  }
) {
  const electronUtils = new ElectronUtils(webContents);

  /* eslint-disable no-await-in-loop */
  while (AbortionSystem.nestedFunctionsMayContinue) {
    await electronUtils.evaluate(
      `${ElectronUtils.generateSelector(
        selector,
        shadowRootSelector
      )}.scrollIntoView({ behavior: ${
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
  return async () => {
    const { webContents } = electronObjects.views[name];
    await scrollIntoView(webContents, selector, {
      strategy,
      smooth
    });
  };
}

export async function scrollIntoViewByPolicy(
  webContents: WebContents,
  selector: string,
  {
    scrollIntoViewPolicy = 'auto',
    overrideStrategy,
    elementExistenceGuaranteed = true,
    shadowRootSelector
  }: {
    scrollIntoViewPolicy?: ScrollIntoViewPolicy;
    overrideStrategy?: ScrollIntoViewStrategy;
    elementExistenceGuaranteed?: boolean;
    shadowRootSelector?: string;
  } = {}
) {
  if (scrollIntoViewPolicy === 'none') {
    return;
  }

  if (scrollIntoViewPolicy === 'always') {
    await scrollIntoView(webContents, selector, {
      strategy: overrideStrategy || 'center',
      elementExistenceGuaranteed,
      shadowRootSelector
    });
    return;
  }

  if (
    !(await new ElectronUtils(webContents).isElementInViewport(selector, {
      shadowRootSelector
    }))
  ) {
    await scrollIntoView(webContents, selector, {
      strategy: overrideStrategy || 'nearest',
      elementExistenceGuaranteed,
      shadowRootSelector
    });
  }
}

export function clickAction(
  selector: string,
  {
    scrollIntoViewPolicy = 'auto',
    elementExistenceGuaranteed = true,
    shadowRootSelector
  }: {
    scrollIntoViewPolicy?: ScrollIntoViewPolicy;
    elementExistenceGuaranteed?: boolean;
    shadowRootSelector?: string;
  } = {}
): ThunkAction {
  return async (dispatch: Dispatch) => {
    const { webContents } = electronObjects.views.puppet;

    if (!webContents.isFocused()) {
      webContents.focus();
    }

    await scrollIntoViewByPolicy(webContents, selector, {
      scrollIntoViewPolicy,
      elementExistenceGuaranteed,
      shadowRootSelector
    });
    // reset zoom factor, just in case someone (accidentally) changed it
    // when zoomed the coordinates are returned unscaled, so clicks miss
    webContents.zoomFactor = 1.0;
    const boundingRect = await new ElectronUtils(webContents).getBoundingBox(
      selector,
      shadowRootSelector
    );

    if (!boundingRect) {
      // eslint-disable-next-line no-console
      console.error(
        `[Click] No bounding box for this element: '${selector}' ${
          shadowRootSelector ? `[shadow-root: '${shadowRootSelector}']` : ''
        }`
      );
      await sleep(500);
      return;
    }

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
  return async (dispatch: Dispatch) => {
    dispatch(willType(text));
    const { webContents } = electronObjects.views.puppet;
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

export function pressKey(keyCode: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    dispatch(willPressKey(keyCode));
    const { webContents } = electronObjects.views.puppet;

    if (!webContents.isFocused()) {
      webContents.focus();
    }

    await new ElectronUtils(webContents).performPressKey(keyCode);
  };
}
