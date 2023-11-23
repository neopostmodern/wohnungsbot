import { RENDERER } from '../constants/targets';
import {
  CALCULATE_BOUNDING_BOX,
  CALCULATE_OVERVIEW_BOUNDING_BOXES,
  CLICK_ANIMATION_CLEAR,
  CLICK_ANIMATION_SHOW,
  SET_BOUNDING_BOX,
  REMOVE_BOUNDING_BOXES_IN_GROUP,
  REFRESH_BOUNDING_BOXES,
  SET_BOUNDING_BOX_GROUP
} from '../constants/actionTypes';
import type { Action } from '../reducers/types';
import type {
  AttachedInformation,
  ElementBoundingBox
} from '../reducers/overlay';
import type { BOUNDING_BOX_GROUPS } from '../constants/boundingBoxGroups';
// TODO PROVOKE TS: first need some error, then move to 'import <default>'

export function clickAnimationShow(
  animationId: string,
  x: number,
  y: number
): Action {
  return {
    type: CLICK_ANIMATION_SHOW,
    payload: {
      animationId,
      type: 'click',
      x,
      y
    },
    meta: {
      target: RENDERER
    }
  };
}
export function clickAnimationClear(animationId: string): Action {
  return {
    type: CLICK_ANIMATION_CLEAR,
    payload: {
      animationId
    },
    meta: {
      target: RENDERER
    }
  };
}
export function calculateOverviewBoundingBoxes(): Action {
  return {
    type: CALCULATE_OVERVIEW_BOUNDING_BOXES,
    payload: null
  };
}
export function refreshBoundingBoxes(): Action {
  return {
    type: REFRESH_BOUNDING_BOXES,
    payload: null
  };
}
export function calculateBoundingBox(
  selector: string,
  {
    group,
    attachedInformation
  }: {
    group?: BOUNDING_BOX_GROUPS;
    attachedInformation?: AttachedInformation;
  }
): Action {
  return {
    type: CALCULATE_BOUNDING_BOX,
    payload: {
      selector,
      group,
      attachedInformation
    }
  };
}
export function setBoundingBox(
  boundingBox: DOMRect,
  selector: string,
  {
    group,
    attachedInformation
  }: {
    group?: BOUNDING_BOX_GROUPS;
    attachedInformation?: AttachedInformation;
  }
): Action {
  return {
    type: SET_BOUNDING_BOX,
    payload: {
      boundingBox,
      selector,
      group,
      attachedInformation
    }
  };
}
export function setBoundingBoxGroup(
  group: BOUNDING_BOX_GROUPS,
  boundingBoxes: Array<ElementBoundingBox>
): Action {
  return {
    type: SET_BOUNDING_BOX_GROUP,
    payload: {
      boundingBoxes,
      group
    }
  };
}
export function removeBoundingBoxesInGroup(group: BOUNDING_BOX_GROUPS) {
  return {
    type: REMOVE_BOUNDING_BOXES_IN_GROUP,
    payload: {
      group
    }
  };
}
