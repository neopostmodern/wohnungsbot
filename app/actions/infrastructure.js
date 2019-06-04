import type { Action } from '../reducers/types';

export const WAKE_UP = 'WAKE_UP';

export function wakeUp(): Action {
  return {
    type: WAKE_UP,
    payload: null
  };
}
