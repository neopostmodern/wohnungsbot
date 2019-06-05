// @flow

import type { Action } from './types';
import {
  NEXT_STAGE,
  PREVIOUS_STAGE,
  RESET_CONFIGURATION,
  SET_CONFIGURATION,
  TOGGLE_POSTCODE
} from '../constants/actionTypes';

export type configurationStateType = {
  stage: number,
  loaded: boolean,
  postcodes: Array<string>
};

const configurationDefaultState: configurationStateType = {
  stage: 0,
  loaded: false,
  postcodes: []
};

export default function configuration(
  state: configurationStateType = configurationDefaultState,
  action: Action
): configurationStateType {
  if (action.type === TOGGLE_POSTCODE) {
    const { postcode } = action.payload;
    const { postcodes } = state;

    if (postcodes.includes(postcode)) {
      return Object.assign({}, state, {
        postcodes: postcodes.filter(z => z !== postcode)
      });
    }

    return Object.assign({}, state, {
      postcodes: postcodes.concat([postcode])
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
