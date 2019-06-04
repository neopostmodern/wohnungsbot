import { RENDERER } from '../constants/targets';

export const CLICK_ANIMATION_SHOW = 'CLICK_ANIMATION_SHOW';
export const CLICK_ANIMATION_CLEAR = 'CLICK_ANIMATION_SHOW';

export function clickAnimationShow(animationId: string, x: number, y: number) {
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

export function clickAnimationClear(animationId: string) {
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
