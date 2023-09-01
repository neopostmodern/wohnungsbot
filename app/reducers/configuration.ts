import { $Values } from "utility-types";
import dotProp from "dot-prop-immutable";
import type { Action } from "./types";
import { NEXT_STAGE, PREVIOUS_STAGE, RESET_CONFIGURATION, RESET_POSTCODES, SET_CONFIGURATION, SET_NUMBER, SET_SEARCH_URL, TOGGLE_FLOOR, TOGGLE_POSTCODE, TOGGLE_BOOLEAN, SET_STRING } from "../constants/actionTypes";
import { objectHash } from "../utils/hash";
import APPLICATION_TEMPLATES from "../constants/applicationTemplates";
import { generateSearchUrl } from "../flat/urlBuilder";
export const ConfigurationVersion = 7;
export const AllFloors = [4, 3, 2, 1, 0];
export type configurationNumbers = "maximumRent" | "minimumArea" | "minimumRooms" | "maximumRooms";
export type configurationBoolean = "hasWBS" | "mustHaveBalcony" | "mustHaveKitchenette" | "noKitchenette" | "onlyOldBuilding" | "onlyUnfurnished" | "noSwapApartment" | "notSpecificallyForSeniors" | "onlySublease" | "noSublease";
export type Filter = {
  postcodes: Array<string>;
  maximumRent?: number | null | undefined;
  minimumArea?: number | null | undefined;
  maximumRentPerSquareMeter?: number | null | undefined;
  minimumRooms?: number | null | undefined;
  maximumRooms?: number | null | undefined;
  onlyOldBuilding: boolean;
  onlyUnfurnished: boolean;
  hasWBS: boolean;
  mustHaveBalcony: boolean;
  mustHaveKitchenette: boolean;
  noKitchenette: boolean;
  noSwapApartment: boolean;
  notSpecificallyForSeniors: boolean;
  onlySublease: boolean;
  noSublease: boolean;
  floors: Array<number>;
};
export const SALUTATIONS = {
  FRAU: 'Frau',
  HERR: 'Herr'
};
export type Salutation = $Values<typeof SALUTATIONS>;
export const USEACCOUNT = {
  JA: 'Ja',
  MANUELL: 'Manuell',
  NEIN: 'Nein'
};
export const LOGINSTATUS = {
  LOGGED_IN: 'LOGGED_IN',
  LOGGED_OUT: 'LOGGED_OUT',
  ERROR: 'ERROR'
};
export type LoginData = {
  useAccount: $Values<typeof USEACCOUNT>;
  userName: string;
  password: string;
  status: $Values<typeof LOGINSTATUS>;
};
export type ContactData = {
  salutation: Salutation;
  firstName: string;
  lastName: string;
  eMail: string;
  telephone?: string;
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
};
export type DataPolicies = {
  flatViewingNotificationMails: boolean;
  autostart: boolean;
  researchDataSharing: boolean;
  artConsent: boolean;
  applicationNotificationMails: boolean;
  fillAsLittleAsPossible: boolean;
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
  moveInWhen: MoveInWhen;
  moveInWho: MoveInWho;
  animals: string;
  employmentStatus: EmploymentStatus;
  income: number | null | undefined;
  hasDocumentsReady: boolean;
};
export type ExperimentalFeatures = {
  sortByNewest: boolean;
};
export type Configuration = {
  stage: number;
  loaded: boolean;
  filter: Filter;
  searchUrl?: string;
  applicationText: string;
  contactData: ContactData;
  immobilienScout24: LoginData;
  additionalInformation: AdditionalInformation;
  policies: DataPolicies;
  configurationVersion: number;
  experimentalFeatures: ExperimentalFeatures;
};
export const getConfigurationFilterHash = (configurationState: Configuration): number => {
  return objectHash(configurationState.filter);
};
const defaultConfiguration: Configuration = {
  stage: 0,
  loaded: false,
  filter: {
    floors: AllFloors.slice(),
    postcodes: [],
    onlyOldBuilding: false,
    onlyUnfurnished: true,
    hasWBS: false,
    mustHaveBalcony: false,
    mustHaveKitchenette: false,
    noKitchenette: false,
    noSwapApartment: false,
    notSpecificallyForSeniors: false,
    onlySublease: false,
    noSublease: false
  },
  applicationText: `${APPLICATION_TEMPLATES.SALUTATION},\n`,
  immobilienScout24: {
    useAccount: USEACCOUNT.NEIN,
    userName: '',
    password: '',
    status: LOGINSTATUS.LOGGED_OUT
  },
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
    autostart: false,
    researchDataSharing: false,
    artConsent: false,
    applicationNotificationMails: false,
    fillAsLittleAsPossible: false
  },
  experimentalFeatures: {
    sortByNewest: false
  },
  configurationVersion: ConfigurationVersion
};

function configurationMigrations(oldConfiguration: Configuration): Configuration {
  let migratedConfiguration = oldConfiguration;

  if (oldConfiguration.configurationVersion < 2) {
    migratedConfiguration = dotProp.set(migratedConfiguration, 'policies.fillAsLittleAsPossible', true);
  }

  if (oldConfiguration.configurationVersion < 3) {
    if (oldConfiguration.additionalInformation.animals.trim().length === 0) {
      migratedConfiguration = dotProp.set(migratedConfiguration, 'additionalInformation.animals', 'Keine');
    }
  }

  if (oldConfiguration.configurationVersion < 4) {
    migratedConfiguration = { ...migratedConfiguration,
      immobilienScout24: {
        useAccount: false,
        userName: '',
        password: '',
        status: LOGINSTATUS.LOGGED_OUT
      }
    };
  }

  if (oldConfiguration.configurationVersion < 5) {
    migratedConfiguration = { ...migratedConfiguration,
      experimentalFeatures: {
        sortByNewest: false
      }
    };
  }

  if (oldConfiguration.configurationVersion < 6) {
    migratedConfiguration = { ...migratedConfiguration,
      immobilienScout24: { ...migratedConfiguration.immobilienScout24,
        useAccount: migratedConfiguration.useAccount ? USEACCOUNT.JA : USEACCOUNT.NEIN
      }
    };
  }

  if (oldConfiguration.configurationVersion < 7) {
    migratedConfiguration = { ...migratedConfiguration,
      policies: { ...migratedConfiguration.policies,
        autostart: false
      }
    };
  }

  // always re-generate search URL at startup (in case the generation function changed, such as after bug #79)
  migratedConfiguration = dotProp.set(migratedConfiguration, 'searchUrl', generateSearchUrl(migratedConfiguration));
  return dotProp.set(migratedConfiguration, 'configurationVersion', ConfigurationVersion);
}

export default function configuration(state: Configuration = defaultConfiguration, action: Action): Configuration {
  if (action.type === TOGGLE_POSTCODE) {
    const {
      postcode
    } = action.payload;
    const {
      postcodes
    } = state.filter;
    const postcodeIndex = postcodes.indexOf(postcode);

    if (postcodeIndex !== -1) {
      return dotProp.delete(state, `filter.postcodes.${postcodeIndex}`);
    }

    return dotProp.merge(state, 'filter.postcodes', [postcode]);
  }

  if (action.type === TOGGLE_FLOOR) {
    const {
      floor
    } = action.payload;
    const {
      floors
    } = state.filter;
    const floorIndex = floors.indexOf(floor);

    if (floorIndex !== -1) {
      return dotProp.delete(state, `filter.floors.${floorIndex}`);
    }

    return dotProp.merge(state, 'filter.floors', [floor]);
  }

  switch (action.type) {
    case SET_CONFIGURATION:
      return configurationMigrations(action.payload.configuration);

    case RESET_CONFIGURATION:
      return defaultConfiguration;

    case NEXT_STAGE:
      return dotProp.set(state, 'stage', state.stage + 1);

    case PREVIOUS_STAGE:
      return dotProp.set(state, 'stage', state.stage - 1);

    case SET_SEARCH_URL:
      return dotProp.set(state, 'searchUrl', action.payload.searchUrl);

    case RESET_POSTCODES:
      return dotProp.set(state, 'filter.postcodes', []);

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