import { RENDERER } from "../constants/targets";
import { CALCULATE_BOUNDING_BOX, CALCULATE_OVERVIEW_BOUNDING_BOXES, CLICK_ANIMATION_CLEAR, CLICK_ANIMATION_SHOW, SET_BOUNDING_BOX, REMOVE_BOUNDING_BOXES_IN_GROUP, REFRESH_BOUNDING_BOXES, SET_BOUNDING_BOX_GROUP } from "../constants/actionTypes";
import type { Action } from "../reducers/types";
import type { AttachedInformation, ElementBoundingBox } from "../reducers/overlay";
import type { BoundingBoxGroup } from "../constants/boundingBoxGroups";
export function clickAnimationShow(animationId: string, x: number, y: number): Action {
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
export function calculateBoundingBox(selector: string, {
  group,
  attachedInformation
}: {
  group?: BoundingBoxGroup;
  attachedInformation?: AttachedInformation;
}): Action {
  return {
    type: CALCULATE_BOUNDING_BOX,
    payload: {
      selector,
      group,
      attachedInformation
    }
  };
}
export function setBoundingBox(boundingBox: ClientRect, selector: string, {
  group,
  attachedInformation
}: {
  group?: BoundingBoxGroup;
  attachedInformation?: AttachedInformation;
}): Action {
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
export function setBoundingBoxGroup(group: BoundingBoxGroup, boundingBoxes: Array<ElementBoundingBox>): Action {
  return {
    type: SET_BOUNDING_BOX_GROUP,
    payload: {
      boundingBoxes,
      group
    }
  };
}
export function removeBoundingBoxesInGroup(group: BoundingBoxGroup) {
  return {
    type: REMOVE_BOUNDING_BOXES_IN_GROUP,
    payload: {
      group
    }
  };
}