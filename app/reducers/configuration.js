// @flow

import type { Action } from './types';
import {
  NEXT_STAGE,
  PREVIOUS_STAGE,
  RESET_CONFIGURATION,
  SET_CONFIGURATION
} from '../constants/actionTypes';

export type configurationStateType = {
  stage: number,
  loaded: boolean
};

const configurationDefaultState: configurationStateType = {
  stage: 0,
  loaded: false
};

export default function configuration(
  state: configurationStateType = configurationDefaultState,
  action: Action
) {
  switch (action.type) {
    case SET_CONFIGURATION:
      return action.payload.configuration;
    case RESET_CONFIGURATION:
      return configurationDefaultState;
    case NEXT_STAGE:
      return Object.assign({}, state, { stage: state.stage + 1 });
    case PREVIOUS_STAGE:
      return Object.assign({}, state, { stage: state.stage - 1 });
    default:
      return state;
  }
}
