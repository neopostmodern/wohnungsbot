import type { configurationStateType } from '../reducers/configuration';
import type { Action } from '../reducers/types';

export const SET_CONFIGURATION = 'SET_CONFIGURATION';
export const RESET_CONFIGURATION = 'RESET_CONFIGURATION';
export const NEXT_STAGE = 'NEXT_STAGE';
export const PREVIOUS_STAGE = 'PREVIOUS_STAGE';

export function setConfiguration(
  configuration: configurationStateType
): Action {
  return {
    type: SET_CONFIGURATION,
    payload: { configuration }
  };
}

export function resetConfiguration(): Action {
  return {
    type: RESET_CONFIGURATION,
    payload: null,
    meta: { configuration: true }
  };
}

export function nextStage(): Action {
  return {
    type: NEXT_STAGE,
    payload: null,
    meta: { configuration: true }
  };
}

export function previousStage(): Action {
  return {
    type: PREVIOUS_STAGE,
    payload: null,
    meta: { configuration: true }
  };
}

