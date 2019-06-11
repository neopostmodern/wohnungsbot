// @flow

import dotProp from 'dot-prop-immutable';
import type { Action } from './types';
import {
  MARK_COMPLETED,
  RESET_CACHE,
  SET_CACHE
} from '../constants/actionTypes';

type Cache = {
  // eslint-disable-next-line flowtype/no-weak-types
  [identifier: string]: any
};

export const CACHE_NAMES = {
  APPLICATIONS: 'applications',
  MAIL: 'mail'
};
export type CacheName = $Values<typeof CACHE_NAMES>;

export type cacheStateType = {
  [name: CacheName]: Cache
};

const cacheDefaultState: cacheStateType = {
  applications: {},
  mail: {}
};

export default function cache(
  state: cacheStateType = cacheDefaultState,
  action: Action
): cacheStateType {
  if (action.type === MARK_COMPLETED) {
    const { name, identifier, data } = action.payload;
    //
    // if (list.includes(identifier)) {
    //   return Object.assign({}, state, {
    //     floors: floors.filter(z => z !== floor)
    //   });
    // }

    return dotProp.set(state, `${name}.${identifier}`, data);
  }

  if (action.type === SET_CACHE) {
    return action.payload.cache;
  }
  if (action.type === RESET_CACHE) {
    return cacheDefaultState;
  }

  return state;
}
