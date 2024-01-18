import type { cacheStateType } from '../reducers/cache';
import type { Action } from '../reducers/types';
import {
  MARK_COMPLETED,
  RESET_CACHE,
  SET_CACHE
} from '../constants/actionTypes';

export function setCache(cache: cacheStateType): Action {
  return {
    type: SET_CACHE,
    payload: {
      cache
    }
  };
}
export function resetCache(): Action {
  return {
    type: RESET_CACHE,
    payload: null,
    meta: {
      cache: true
    }
  };
}
export function markCompleted(
  name: string,
  identifier: string,
  data: any
): Action {
  return {
    type: MARK_COMPLETED,
    payload: {
      name,
      identifier,
      data
    },
    meta: {
      cache: true
    }
  };
}
