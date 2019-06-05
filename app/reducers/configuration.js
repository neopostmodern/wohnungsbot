// @flow

import type { Action } from './types';
import {
  NEXT_STAGE,
  PREVIOUS_STAGE,
  RESET_CONFIGURATION,
  SET_CONFIGURATION,
  TOGGLE_ZIP_CODE
} from '../constants/actionTypes';

export type configurationStateType = {
  stage: number,
  loaded: boolean,
  zipCodes: Array<string>
};

const configurationDefaultState: configurationStateType = {
  stage: 0,
  loaded: false,
  zipCodes: []
};

export default function configuration(
  state: configurationStateType = configurationDefaultState,
  action: Action
): configurationStateType {
  if (action.type === TOGGLE_ZIP_CODE) {
    const { zipCode } = action.payload;
    const { zipCodes } = state;

    if (zipCodes.includes(zipCode)) {
      return Object.assign({}, state, {
        zipCodes: zipCodes.filter(z => z !== zipCode)
      });
    }

    return Object.assign({}, state, {
      zipCodes: zipCodes.concat([zipCode])
    });
  }

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
