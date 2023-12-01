import dotProp from 'dot-prop-immutable';
import type { Action } from './types';
import {
  SET_FLAT_DATA,
  SET_OVERVIEW_DATA,
  SET_VERDICT
} from '../constants/actionTypes';

export type StringBoolean = 'true' | 'false';
export type PictureDescription = {
  '@xlink.href': string;
  '@xsi.type': 'common:Picture';
  floorplan: StringBoolean;
  titlePicture: StringBoolean;
};
export type RawOverviewDataEntry = {
  '@id': string;
  attributes: Record<string, string>;
  realEstateTags: {
    tag: Array<string>;
  };
  'resultlist.realEstate': {
    address: {
      city: string;
      postcode: string;
      preciseHouseNumber: boolean;
      houseNumber?: string;
      description: {
        text: string;
      };
      street?: string;
      quarter: string;
      wgs84Coordinate: {
        latitude: number;
        longitude: number;
      };
    };
    balcony: StringBoolean;
    builtInKitchen: StringBoolean;
    calculatedPrice: {
      marketingType: 'BUDGET_RENT';
      priceIntervalType: 'MONTH';
      rentScope: 'WARM_RENT';
      value: number;
    };
    contactDetails: {
      cellPhoneNumber?: string;
      company?: string;
      firstname?: string;
      lastname?: string;
      phoneNumber?: string;
      salutation: 'MALE' | 'FEMALE' | 'NO_SALUTATION';
    };
    floorPlan: StringBoolean;
    galleryAttachments: {
      attachment: Array<PictureDescription>;
    };
    garden: StringBoolean;
    listingType: 'S';
    livingSpace: string;
    numberOfRooms: number;
    price: {
      marketingType: 'RENT';
      priceIntervalType: 'MONTH';
      value: string;
    };
    privateOffer: StringBoolean;
    realtorCompanyName: string;
    title: string;
    titlePicture: PictureDescription;
  };
  project?: {};
  alreadyApplied?: boolean;
};
export type RawOverviewData = Array<RawOverviewDataEntry>;
export type FlatAddress = {
  postcode: string;
  description: string;
  street?: string;
  houseNumber?: string;
  neighborhood: string;
};
export type FlatContactDetails = {
  company?: string;
  firstName?: string;
  lastName?: string;
  salutation: 'MALE' | 'FEMALE' | 'NO_SALUTATION';
};
export type OverviewDataEntry = {
  id: string;
  title: string;
  address: FlatAddress;
  contactDetails: FlatContactDetails;
  balcony: boolean;
  builtInKitchen: boolean;
  rent: number;
  area: number;
  isPartOfProject: boolean;
  hasAlreadyApplied: boolean;
};
export type RawFlatData = {
  obj_scoutId: string;
  obj_yearConstructed: string;
  obj_totalRent: string;
  obj_baseRent: string;
  obj_serviceCharge: string;
  obj_floor: string;
  additionalData: {
    requiresWBS: boolean;
  };
};
export type FlatData = {
  id: string;
  yearConstructed: number;
  rent: {
    total: number;
    base: number;
    additional: number;
  };
  floor: number;
  requiresWBS: boolean;
};
export const enum FlatAction {
  APPLY = 'APPLY',
  INVESTIGATE = 'INVESTIGATE',
  NOTIFY_VIEWING_DATE = 'NOTIFY_VIEWING_DATE',
  IGNORE = 'IGNORE',
  DISCARD = 'DISCARD'
}
export const enum VerdictScope {
  OVERVIEW = 'OVERVIEW',
  COMPLETE = 'COMPLETE'
}
export type Verdict = {
  flatId: string;
  configurationHash: number;
  result: boolean;
  scope: VerdictScope;
  reasons: Array<{
    reason: string;
    result: boolean;
  }>;
  action?: FlatAction;
};
export type Verdicts = Record<string, Verdict>;
export type dataStateType = {
  overview: Record<string, OverviewDataEntry>;
  flat: Record<string, FlatData>;
  verdicts: Verdicts;
};
const dataDefaultState: dataStateType = {
  overview: {},
  verdicts: {},
  flat: {}
};
export default function data(
  // eslint-disable-next-line default-param-last
  state: dataStateType = dataDefaultState,
  action: Action
): dataStateType {
  if (action.type === SET_OVERVIEW_DATA) {
    return { ...state, overview: action.payload.data };
  }

  if (action.type === SET_FLAT_DATA) {
    const { flatData } = action.payload;
    return dotProp.set(state, `flat.${flatData.id}`, flatData);
  }

  if (action.type === SET_VERDICT) {
    return dotProp.set(
      state,
      `verdicts.${action.payload.flatId}`,
      action.payload.verdict
    );
  }

  return state;
}
