// @flow

import type { WebContents } from 'electron';
import ElectronUtils from './electronUtils';
import { clickAction, type } from '../actions/botHelpers';
import { sleep } from './async';
import type {Dispatch, Store} from '../reducers/types';
import AbortionSystem from './abortionSystem';
import {setBotIsActing, setBotMessage} from "../actions/bot";
import {setInteractiveMode} from "../actions/electron";

export default class ElectronUtilsRedux extends ElectronUtils {
  dispatch: Dispatch;

  constructor(webContents: WebContents, dispatch?: Dispatch) {
    super(webContents);

    this.dispatch = dispatch;
  }

  async click(selector: string, shadowRootSelector?: string) {
    await this.dispatch(clickAction(selector, { shadowRootSelector }));
  }

  async clickAndEnsureFocused(selector: string) {
    /* eslint-disable no-await-in-loop */
    while (!(await this.isElementSelected(selector))) {
      await this.dispatch(clickAction(selector));
      await sleep(800);
    }
    /* eslint-enable no-await-in-loop */
  }

  async humanInteraction(isHumanActionStillNeeded: () => Promise<boolean>, delayBeforeFirstDoneCheckMillis: number = 3_000) {
    await sleep(delayBeforeFirstDoneCheckMillis);
    if (!(await isHumanActionStillNeeded())) {
      return;
    }

    this.dispatch(setBotMessage('Mensch! Du bist dran.'));

    if (!this.webContents.isFocused()) {
      this.webContents.focus();
    }
    this.dispatch(setInteractiveMode(true));

    while (await isHumanActionStillNeeded()) {
      await sleep(1000);
    }
    this.dispatch(setBotMessage('Geschafft, ich übernehme wieder!'));
    this.dispatch(setInteractiveMode(false));
  }

  async fillText(selector: string, text: string, secondTry: boolean = false) {
    await sleep(500);
    const currentValue = await this.getValue(selector);
    if (currentValue) {
      if (currentValue === text) {
        return;
      }

      await this.clickAndEnsureFocused(selector);
      this.webContents.selectAll();
      await sleep(300);
      this.webContents.delete();
    } else {
      await this.clickAndEnsureFocused(selector);
    }

    await sleep(500);
    await this.dispatch(type(text));

    if (
      AbortionSystem.nestedFunctionsMayContinue &&
      (await this.getValue(selector)) !== text
    ) {
      if (secondTry) {
        throw Error(
          `Repeatedly failed to write text to "${selector}": "${text}"`
        );
      }

      await this.fillText(selector, text, true);
    }
  }
}
