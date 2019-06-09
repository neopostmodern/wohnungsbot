// @flow

import type { Action } from './types';
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
  TOGGLE_BOOLEAN
} from '../constants/actionTypes';
import { objectHash } from '../utils/hash';

export const AllFloors = [4, 3, 2, 1, 0];

export type configurationNumbers =
  | 'maximumRent'
  | 'minimumArea'
  | 'minimumRooms'
  | 'maximumRooms';

export type configurationBoolean =
  | 'hasWBS'
  | 'mustHaveBalcony'
  | 'mustHaveKitchenette'
  | 'noKitchenette'
  | 'onlyOldBuilding'
  | 'onlyUnfurnished';

export type configurationStateType = {
  stage: number,
  loaded: boolean,
  searchUrl?: string,
  postcodes: Array<string>,
  maximumRent?: ?number,
  minimumArea?: ?number,
  minimumRooms?: ?number,
  maximumRooms?: ?number,
  onlyOldBuilding: boolean,
  onlyUnfurnished: boolean,
  hasWBS: boolean,
  mustHaveBalcony: boolean,
  mustHaveKitchenette: boolean,
  noKitchenette: boolean,
  floors: Array<number>
};

export const getConfigurationHash = (
  configurationState: configurationStateType
): number => {
  const staticConfigurationState = Object.assign({}, configurationState);
  delete staticConfigurationState.loaded;
  delete staticConfigurationState.stage;
  delete staticConfigurationState.searchUrl;
  return objectHash(staticConfigurationState);
};

const configurationDefaultState: configurationStateType = {
  stage: 0,
  loaded: false,
  floors: AllFloors.slice(),
  postcodes: [],
  onlyOldBuilding: false,
  onlyUnfurnished: false,
  hasWBS: false,
  mustHaveBalcony: false,
  mustHaveKitchenette: false,
  noKitchenette: false
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

  if (action.type === TOGGLE_FLOOR) {
    const { floor } = action.payload;
    const { floors } = state;

    if (floors.includes(floor)) {
      return Object.assign({}, state, {
        floors: floors.filter(z => z !== floor)
      });
    }

    return Object.assign({}, state, {
      floors: floors.concat([floor])
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
    case SET_SEARCH_URL:
      return Object.assign({}, state, { searchUrl: action.payload.searchUrl });
    case RESET_POSTCODES:
      return Object.assign({}, state, { postcodes: [] });
    case TOGGLE_BOOLEAN:
      return Object.assign({}, state, {
        [action.payload.name]: !state[action.payload.name]
      });
    case SET_NUMBER:
      return Object.assign({}, state, {
        [action.payload.name]: action.payload.value
      });
    default:
      return state;
  }
}
