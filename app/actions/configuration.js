import type {
  configurationBoolean,
  configurationNumbers,
  Configuration
} from '../reducers/configuration';
import type { Action, Dispatch } from '../reducers/types';
import {
  NEXT_STAGE,
  PREVIOUS_STAGE,
  RESET_CONFIGURATION,
  RESET_POSTCODES,
  SET_CONFIGURATION,
  SET_NUMBER,
  SET_SEARCH_URL,
  TOGGLE_FLOOR,
  TOGGLE_POSTCODE,
  TOGGLE_BOOLEAN,
  SET_STRING,
  PULL_WEB_CONFIGURATION,
  PUSH_WEB_CONFIGURATION
} from '../constants/actionTypes';

export function setConfiguration(configuration: Configuration): Action {
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

export function togglePostcode(postcode: string): Action {
  return {
    type: TOGGLE_POSTCODE,
    payload: { postcode },
    meta: { configuration: true }
  };
}

export function resetPostcodes(): Action {
  return {
    type: RESET_POSTCODES,
    payload: null,
    meta: { configuration: true }
  };
}

export function toggleFloor(floor: number): Action {
  return {
    type: TOGGLE_FLOOR,
    payload: { floor },
    meta: { configuration: true }
  };
}

export function toggleBoolean(name: configurationBoolean): Action {
  return {
    type: TOGGLE_BOOLEAN,
    payload: { name },
    meta: { configuration: true }
  };
}

export function setNumber(name: configurationNumbers, value: ?number): Action {
  return {
    type: SET_NUMBER,
    payload: { name, value },
    meta: { configuration: true }
  };
}

export function setString(name: string, value: ?string): Action {
  return {
    type: SET_STRING,
    payload: { name, value },
    meta: { configuration: true }
  };
}

export function setSearchUrl(searchUrl: string): Action {
  return {
    type: SET_SEARCH_URL,
    payload: { searchUrl },
    meta: { configuration: true }
  };
}

export function pullWebConfiguration(isWakeUp: boolean) {
  return {
    type: PULL_WEB_CONFIGURATION,
    payload: { isWakeUp }
  };
}

export function pushWebConfiguration() {
  return async (dispatch: Dispatch) => {
    await dispatch({
      type: PUSH_WEB_CONFIGURATION,
      payload: null
    });
  };
}
