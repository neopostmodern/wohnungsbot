// @flow
import type { Action } from './types';
import {
  CLICK_ANIMATION_CLEAR,
  CLICK_ANIMATION_SHOW
} from '../actions/animations';

export type baseAnimation = {
  animationId: string
};
export type clickAnimation = {
  type: 'click',
  x: number,
  y: number
} & baseAnimation;
export type anyAnimation = clickAnimation;

export type animationsStateType = {
  animations: Array<anyAnimation>
};

const animationsDefaultState: animationsStateType = {
  animations: []
};

export default function animations(
  state: animationsStateType = animationsDefaultState,
  action: Action
): animationsStateType {
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

  return state;
}
