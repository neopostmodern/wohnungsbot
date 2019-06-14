import type { Dispatch as ReduxDispatch, Store as ReduxStore } from 'redux';
import type { electronStateType } from './electron';
import type { overlayStateType } from './overlay';
import type { dataStateType } from './data';
import type { Configuration } from './configuration';
import type { cacheStateType } from './cache';
import type { schedulerStateType } from './scheduler';
import type { botStateType } from './bot';

export type stateType = {
  electron: electronStateType,
  overlay: overlayStateType,
  data: dataStateType,
  configuration: Configuration,
  cache: cacheStateType,
  scheduler: schedulerStateType,
  bot: botStateType
};

export type Action = {
  +type: string,
  // eslint-disable-next-line flowtype/no-weak-types
  payload: any,
  // eslint-disable-next-line flowtype/space-after-type-colon
  meta?:
    | {
        target: string
      }
    | {
        queue: true,
        message: string
      }
};

export type GetState = () => stateType;

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<stateType, Action>;
