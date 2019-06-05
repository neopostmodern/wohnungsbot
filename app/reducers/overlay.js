// @flow
import type { Action } from './types';
import {
  CLICK_ANIMATION_CLEAR,
  CLICK_ANIMATION_SHOW,
  SET_OVERVIEW_BOUNDARIES
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

export type overlayStateType = {
  animations: Array<anyAnimation>,
  overviewBoundaries?: Array<{ id: string, boundaries: ClientRect }>
};

const overlayDefaultState: overlayStateType = {
  animations: []
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

  if (action.type === SET_OVERVIEW_BOUNDARIES) {
    return Object.assign({}, state, {
      overviewBoundaries: action.payload.overviewBoundaries
    });
  }

  return state;
}
