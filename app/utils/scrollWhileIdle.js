// @flow

import { sleep } from './async';
import ElectronUtils from './electronUtils';
import type { Dispatch, GetState } from '../reducers/types';
import {
  calculateOverviewBoundingBoxes,
  removeBoundingBoxesInGroup
} from '../actions/overlay';
import BOUNDING_BOX_GROUPS from '../constants/boundingBoxGroups';

export default function scrollWhileIdle(
  getState: GetState,
  dispatch: Dispatch
) {
  let alive = true;
  let direction = 1;

  const electronUtils = new ElectronUtils(
    getState().electron.views.puppet.browserView.webContents
  );

  const scroll = async () => {
    if (getState().bot.isActive === false) {
      electronUtils.scrollBy(0, 100 * direction);
      dispatch(calculateOverviewBoundingBoxes());
    }

    await sleep(1000);

    if (
      direction > 0 &&
      (await electronUtils.evaluate(
        `window.scrollY + window.innerHeight > document.body.scrollHeight * 0.95`
      ))
    ) {
      direction = -1;
    } else if (
      direction < 0 &&
      (await electronUtils.evaluate(`window.scrollY < 50`))
    ) {
      direction = 1;
    }

    if (alive) {
      scroll();
    }
  };

  setImmediate(scroll);

  return () => {
    alive = false;
  };
}
