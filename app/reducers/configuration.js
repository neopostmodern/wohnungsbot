// @flow

import dotProp from 'dot-prop-immutable';
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
  TOGGLE_BOOLEAN,
  SET_STRING
} from '../constants/actionTypes';
import { objectHash } from '../utils/hash';
import APPLICATION_TEMPLATES from '../constants/applicationTemplates';

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

export const SALUTATIONS = {
  FRAU: 'Frau',
  HERR: 'Herr'
};
export type Salutation = $Values<typeof SALUTATIONS>;

export type ContactData = {
  salutation: Salutation,
  firstName: string,
  lastName: string,
  eMail: string,
  telephone?: string,
  street: string,
  houseNumber: string,
  postcode: string,
  city: string
};

export type DataPolicies = {
  flatViewingNotificationMails: boolean,
  researchDataSharing: boolean
};

export const MOVE_IN_WHEN = {
  NOW: 'Ab sofort',
  FLEXIBLE: 'Flexibel'
};
export type MoveInWhen = $Values<typeof MOVE_IN_WHEN>;

export const MOVE_IN_WHO = {
  SINGLE: 'Einpersonenhaushalt',
  TWO_ADULTS: 'Zwei Erwachsene',
  FAMILY: 'Familie',
  SHARED_FLAT: 'Wohngemeinschaft'
};
export type MoveInWho = $Values<typeof MOVE_IN_WHO>;

export const EMPLOYMENT_STATUS = {
  EMPLOYEE: 'Angestellte_r',
  WORKER: 'Arbeiter_in',
  SELF_EMPLOYED: 'Selbstständig',
  CIVIL_SERVANT: 'Beamte_r',
  TRAINEE: 'Auszubildende_r',
  STUDENT: 'Student_in',
  PHD_STUDENT: 'Doktorand_in',
  HOUSEPERSON: 'Hausmensch',
  UNEMPLOYED: 'Arbeitslos',
  RETIRED: 'Renter_in',
  OTHER: 'Sonstige'
};
export type EmploymentStatus = $Values<typeof EMPLOYMENT_STATUS>;

export type AdditionalInformation = {
  moveInWhen: MoveInWhen,
  moveInWho: MoveInWho,
  animals: string,
  employmentStatus: EmploymentStatus,
  income: ?number,
  hasDocumentsReady: boolean
};

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
  floors: Array<number>,
  applicationText: string,
  contactData: ContactData,
  additionalInformation: AdditionalInformation,
  policies: DataPolicies
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
  noKitchenette: false,
  applicationText: `${APPLICATION_TEMPLATES.SALUTATION},\n`,
  contactData: {
    salutation: SALUTATIONS.FRAU,
    firstName: '',
    lastName: '',
    eMail: '',
    street: '',
    houseNumber: '',
    postcode: '',
    city: ''
  },
  additionalInformation: {
    moveInWhen: MOVE_IN_WHEN.NOW,
    moveInWho: MOVE_IN_WHO.SINGLE,
    animals: '',
    employmentStatus: EMPLOYMENT_STATUS.EMPLOYEE,
    income: null,
    hasDocumentsReady: true
  },
  policies: {
    flatViewingNotificationMails: false,
    researchDataSharing: false
  }
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
      return dotProp.toggle(state, action.payload.name);
    case SET_NUMBER:
      return dotProp.set(state, action.payload.name, action.payload.value);
    case SET_STRING:
      return dotProp.set(state, action.payload.name, action.payload.value);
    default:
      return state;
  }
}
