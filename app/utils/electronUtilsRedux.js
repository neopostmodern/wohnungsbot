// @flow

import type { WebContents } from 'electron';
import ElectronUtils from './electronUtils';
import { clickAction, type } from '../actions/botHelpers';
import { sleep } from './async';
import type { Dispatch } from '../reducers/types';

export default class ElectronUtilsRedux extends ElectronUtils {
  dispatch: Dispatch;

  constructor(webContents: WebContents, dispatch?: Dispatch) {
    super(webContents);

    this.dispatch = dispatch;
  }

  async fillText(selector: string, text: string) {
    const currentValue = await this.getValue(selector);
    if (currentValue) {
      if (currentValue === text) {
        return;
      }

      await this.dispatch(clickAction(selector));
      await sleep(800);
      this.webContents.selectAll();
      await sleep(300);
      this.webContents.delete();
    } else {
      await this.dispatch(clickAction(selector));
    }

    await sleep(500);
    await this.dispatch(type(text));
  }
}
