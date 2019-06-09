// @flow

import type { Action } from './types';
import {
  MARK_COMPLETED,
  // RESET_CACHE,
  SET_CACHE
} from '../constants/actionTypes';

export type cacheStateType = {
  applications: Array<string>,
  mail: Array<string>
};

const cacheDefaultState: cacheStateType = {
  applications: [],
  mail: []
};

export default function cache(
  state: cacheStateType = cacheDefaultState,
  action: Action
): cacheStateType {
  if (action.type === MARK_COMPLETED) {
    const { name, identifier } = action.payload;
    const list = state[name];
    //
    // if (list.includes(identifier)) {
    //   return Object.assign({}, state, {
    //     floors: floors.filter(z => z !== floor)
    //   });
    // }

    return Object.assign({}, state, {
      [name]: list.concat([identifier])
    });
  }

  if (action.type === SET_CACHE) {
    return action.payload.cache;
  }
  // if (action.type === RESET_CACHE) {
  //   return cacheDefaultState;
  // }

  return state;
}
