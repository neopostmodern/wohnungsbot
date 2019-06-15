// @flow

import {
  calculateBoundingBox,
  calculateOverviewBoundingBoxes,
  clickAnimationClear,
  clickAnimationShow,
  refreshBoundingBoxes,
  setBoundingBox
} from '../actions/overlay';
import { uniqueId } from '../utils/random';
import type { Action, Dispatch, Store } from '../reducers/types';
import {
  CALCULATE_BOUNDING_BOX,
  CALCULATE_OVERVIEW_BOUNDING_BOXES,
  REFRESH_BOUNDING_BOXES,
  SET_BOT_MESSAGE,
  SET_BROWSER_VIEW_READY,
  SET_SHOW_OVERLAY,
  WILL_CLICK
} from '../constants/actionTypes';
import type { OverviewDataEntry } from '../reducers/data';
import { getBoundingBox, isElementInViewport } from '../actions/botHelpers';
import BOUNDING_BOX_GROUPS from '../constants/boundingBoxGroups';
import { setBotMessage } from '../actions/bot';

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => async (action: Action) => {
  if (action.type === WILL_CLICK) {
    const animationId = uniqueId();
    next(clickAnimationShow(animationId, action.payload.x, action.payload.y));
    setTimeout(() => next(clickAnimationClear(animationId)), 5000);
  }

  if (action.type === SET_BOT_MESSAGE && action.payload.timeout) {
    setTimeout(() => {
      if (store.getState().bot.message === action.payload.message) {
        store.dispatch(setBotMessage(null));
      }
    });
  }

  // todo: invalidate / remove boundaries on URL change etc.

  if (action.type === CALCULATE_OVERVIEW_BOUNDING_BOXES) {
    const {
      electron: {
        views: { puppet }
      },
      data: { overview }
    } = store.getState();

    const { webContents } = puppet.browserView;

    if (overview) {
      Object.values(overview).forEach(
        // $FlowFixMe -- Object.values
        async (entry: OverviewDataEntry) => {
          const selector = `#result-${entry.id}`;
          if (await isElementInViewport(webContents, selector, false, false)) {
            store.dispatch(
              calculateBoundingBox(selector, {
                group: BOUNDING_BOX_GROUPS.OVERVIEW,
                attachedInformation: { flatId: entry.id }
              })
            );
          }
        }
      );
    }
  }

  if (action.type === REFRESH_BOUNDING_BOXES) {
    const {
      overlay: { boundingBoxes }
    } = store.getState();

    boundingBoxes.forEach(boundingBox => {
      const { selector, group, attachedInformation } = boundingBox;
      store.dispatch(
        calculateBoundingBox(selector, { group, attachedInformation })
      );
    });
  }

  if (action.type === CALCULATE_BOUNDING_BOX) {
    const {
      electron: {
        views: {
          puppet: {
            browserView: { webContents }
          }
        }
      }
    } = store.getState();

    const { selector, group, attachedInformation } = action.payload;

    const boundingBox = await getBoundingBox(webContents, selector);

    store.dispatch(
      setBoundingBox(boundingBox, selector, { group, attachedInformation })
    );
  }

  if (action.type === SET_SHOW_OVERLAY && action.payload.showOverlay) {
    store.dispatch(calculateOverviewBoundingBoxes());
  }

  if (
    action.type === SET_BROWSER_VIEW_READY &&
    action.payload.ready &&
    action.payload.name === 'puppet'
  ) {
    store.dispatch(refreshBoundingBoxes());
  }

  return next(action);
};
