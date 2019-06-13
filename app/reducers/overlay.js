// @flow
import type { Action } from './types';
import {
  CLICK_ANIMATION_CLEAR,
  CLICK_ANIMATION_SHOW,
  REMOVE_BOUNDING_BOXES_IN_GROUP,
  SET_BOUNDING_BOX
} from '../constants/actionTypes';

export type baseAnimation = {
  animationId: string
};
export type clickAnimation = {
  type: 'click',
  x: number,
  y: number
} & baseAnimation;
export type anyAnimation = clickAnimation;

// eslint-disable-next-line flowtype/no-weak-types
export type AttachedInformation = { [key: string]: any };
export type ElementBoundingBox = {
  selector: string,
  group?: string,
  attachedInformation: AttachedInformation,
  boundingBox: ClientRect
};

export type overlayStateType = {
  animations: Array<anyAnimation>,
  boundingBoxes: Array<ElementBoundingBox>
};

const overlayDefaultState: overlayStateType = {
  animations: [],
  boundingBoxes: []
};

export default function overlay(
  state: overlayStateType = overlayDefaultState,
  action: Action
): overlayStateType {
  if (action.type === CLICK_ANIMATION_SHOW) {
    const animationsTemp = state.animations.slice();
    animationsTemp.push(action.payload);
    return Object.assign({}, state, { animations: animationsTemp });
  }

  if (action.type === CLICK_ANIMATION_CLEAR) {
    return Object.assign({}, state, {
      animations: state.animations.filter(
        animation => animation.animationId !== action.payload.animationId
      )
    });
  }

  if (action.type === SET_BOUNDING_BOX) {
    return Object.assign({}, state, {
      boundingBoxes: state.boundingBoxes
        .filter(({ selector }) => selector !== action.payload.selector)
        .concat([action.payload])
    });
  }

  if (action.type === REMOVE_BOUNDING_BOXES_IN_GROUP) {
    return Object.assign({}, state, {
      boundingBoxes: state.boundingBoxes.filter(
        ({ group }) => group !== action.payload.group
      )
    });
  }

  return state;
}
