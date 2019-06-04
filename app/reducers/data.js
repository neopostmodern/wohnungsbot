// @flow

import { DATA_OVERVIEW_SET } from '../actions/electron';
import type { Action } from './types';

export type dataStateType = {
  overview?: any
};

const dataDefaultState: dataStateType = {};

export default function data(
  state: dataStateType = dataDefaultState,
  action: Action
) {
  if (action.type === DATA_OVERVIEW_SET) {
    return Object.assign({}, state, { overview: action.payload.data });
  }

  return state;
}
