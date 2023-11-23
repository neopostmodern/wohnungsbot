import dotProp from 'dot-prop-immutable';
import type { Action } from './types';
import {
  MARK_COMPLETED,
  RESET_CACHE,
  SET_CACHE
} from '../constants/actionTypes';

export type BaseCacheEntry = {
  timestamp: number;
};
export type ApplicationData = {
  flatId: string;
  success: boolean;
  addressDescription: string;
  reason?: string;
  pdfPath?: string;
};
export type EmailData = {
  flatId: string;
};
export type Cache<T> = Record<string, BaseCacheEntry & T>;
export const enum CacheNames {
  APPLICATIONS = 'applications',
  MAIL = 'mail'
}
export type cacheStateType = {
  applications: Cache<ApplicationData>;
  mail: Cache<EmailData>;
};
const cacheDefaultState: cacheStateType = {
  applications: {},
  mail: {}
};
export default function cache(
  // eslint-disable-next-line default-param-last
  state: cacheStateType = cacheDefaultState,
  action: Action
): cacheStateType {
  if (action.type === MARK_COMPLETED) {
    const { name, identifier, data } = action.payload;
    return dotProp.set(state, `${name}.${identifier}`, {
      ...data,
      timestamp: new Date().getTime()
    });
  }

  if (action.type === SET_CACHE) {
    return action.payload.cache;
  }

  if (action.type === RESET_CACHE) {
    return cacheDefaultState;
  }

  return state;
}
