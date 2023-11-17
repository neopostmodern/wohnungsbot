import {
  calculateBoundingBox,
  calculateOverviewBoundingBoxes,
  clickAnimationClear,
  clickAnimationShow,
  refreshBoundingBoxes,
  setBoundingBox,
  setBoundingBoxGroup
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
import BOUNDING_BOX_GROUPS from '../constants/boundingBoxGroups';
import { setBotMessage } from '../actions/bot';
import ElectronUtils from '../utils/electronUtils';
import { entrySelector } from '../utils/selectors';
import { electronObjects } from '../store/electronObjects';

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
    }, action.payload.timeout);
  }

  // todo: invalidate / remove boundaries on URL change etc.
  if (action.type === CALCULATE_OVERVIEW_BOUNDING_BOXES) {
    const {
      data: { overview }
    } = store.getState();
    const { webContents } = electronObjects.views.puppet;
    const electronUtils = new ElectronUtils(webContents);

    if (overview) {
      const boundingBoxes = (
        await Promise.all(
          Object.values(overview).map(async (entry: OverviewDataEntry) => {
            const selector = entrySelector(entry.id);

            if (
              !(await electronUtils.isElementInViewport(selector, {
                mustIncludeBottom: false,
                mustIncludeTop: false
              }))
            ) {
              return null;
            }

            return {
              selector,
              boundingBox: await electronUtils.getBoundingBox(selector),
              attachedInformation: {
                flatId: entry.id
              },
              group: BOUNDING_BOX_GROUPS.OVERVIEW
            };
          })
        )
      ).filter((entry) => entry !== null);
      store.dispatch(
        setBoundingBoxGroup(BOUNDING_BOX_GROUPS.OVERVIEW, boundingBoxes)
      );
    }
  }

  if (action.type === REFRESH_BOUNDING_BOXES) {
    const {
      overlay: { boundingBoxes }
    } = store.getState();
    boundingBoxes.forEach((boundingBox) => {
      const { selector, group, attachedInformation } = boundingBox;
      store.dispatch(
        calculateBoundingBox(selector, {
          group,
          attachedInformation
        })
      );
    });
  }

  if (action.type === CALCULATE_BOUNDING_BOX) {
    const { webContents } = electronObjects.views.puppet;
    const { selector, group, attachedInformation } = action.payload;
    const boundingBox = await new ElectronUtils(webContents).getBoundingBox(
      selector
    );

    if (boundingBox) {
      store.dispatch(
        setBoundingBox(boundingBox, selector, {
          group,
          attachedInformation
        })
      );
    }
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
