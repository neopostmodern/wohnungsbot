// @flow

import type { Action } from './types';
import { DATA_OVERVIEW_SET } from '../constants/actionTypes';

// todo: refine typing
// eslint-disable-next-line flowtype/no-weak-types
export type OverviewDataType = Array<Object>;
export type dataStateType = {
  overview?: OverviewDataType
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
