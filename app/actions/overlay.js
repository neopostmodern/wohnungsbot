// @flow

import { RENDERER } from '../constants/targets';
import {
  CALCULATE_OVERVIEW_BOUNDARIES,
  CLICK_ANIMATION_CLEAR,
  CLICK_ANIMATION_SHOW,
  SET_OVERVIEW_BOUNDARIES
} from '../constants/actionTypes';
import type { Action } from '../reducers/types';

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

export function calculateOverviewBoundaries(): Action {
  return {
    type: CALCULATE_OVERVIEW_BOUNDARIES,
    payload: null
  };
}

export function setOverviewBoundaries(overviewBoundaries): Action {
  return {
    type: SET_OVERVIEW_BOUNDARIES,
    payload: { overviewBoundaries }
  };
}
