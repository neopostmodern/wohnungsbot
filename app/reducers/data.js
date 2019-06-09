// @flow

import dotProp from 'dot-prop-immutable';
import type { Action } from './types';
import {
  SET_FLAT_DATA,
  SET_OVERVIEW_DATA,
  SET_VERDICT
} from '../constants/actionTypes';

export type StringBoolean = 'true' | 'false';
export type PictureDescription = {
  '@xlink.href': string,
  '@xsi.type': 'common:Picture',
  floorplan: StringBoolean,
  titlePicture: StringBoolean
};
export type RawOverviewDataEntry = {
  '@id': string,
  attributes: { [key: string]: string },
  realEstateTags: { tag: Array<string> },
  'resultlist.realEstate': {
    address: {
      city: string,
      postcode: string,
      preciseHouseNumber: boolean,
      houseNumber?: string,
      description: {
        text: string
      },
      street?: string,
      quarter: string,
      wgs84Coordinate: {
        latitude: number,
        longitude: number
      }
    },
    balcony: StringBoolean,
    builtInKitchen: StringBoolean,
    calculatedPrice: {
      marketingType: 'BUDGET_RENT',
      priceIntervalType: 'MONTH',
      rentScope: 'WARM_RENT',
      value: number
    },
    contactDetails: {
      cellPhoneNumber?: string,
      company?: string,
      firstname?: string,
      lastname?: string,
      phoneNumber?: string,
      salutation: 'MALE' | 'FEMALE' | 'NO_SALUTATION'
    },
    floorPlan: StringBoolean,
    galleryAttachments: {
      attachment: Array<PictureDescription>
    },
    garden: StringBoolean,
    listingType: 'S',
    livingSpace: number,
    numberOfRooms: number,
    price: {
      marketingType: 'RENT',
      priceIntervalType: 'MONTH',
      value: number
    },
    privateOffer: StringBoolean,
    realtorCompanyName: string,
    title: string,
    titlePicture: PictureDescription
  }
};
// eslint-disable-next-line flowtype/no-weak-types
export type RawOverviewData = Array<RawOverviewDataEntry>;

export type OverviewDataEntry = {|
  id: string,
  title: string,
  address: {
    postcode: string,
    description: string,
    street?: string,
    houseNumber?: string,
    quarter: string
  },
  balcony: boolean,
  builtInKitchen: boolean
|};

export type RawFlatData = {
  obj_scoutId: string,
  obj_yearConstructed: string,
  obj_totalRent: string,
  obj_baseRent: string,
  obj_serviceCharge: string,
  obj_floor: string,
  additionalData: {
    requiresWBS: boolean
  }
};

export type FlatData = {|
  id: string,
  yearConstructed: number,
  rent: {
    total: number,
    base: number,
    additional: number
  },
  floor: number,
  requiresWBS: boolean
|};

function parseBoolean(stringBoolean: StringBoolean): boolean {
  return stringBoolean === 'true';
}

function processOverviewDataEntry(
  entry: RawOverviewDataEntry
): OverviewDataEntry {
  const realEstate = entry['resultlist.realEstate'];
  const processedEntry: OverviewDataEntry = {
    id: entry['@id'],
    title: realEstate.title,
    address: {
      postcode: realEstate.address.postcode,
      description: realEstate.address.description.text,
      quarter: realEstate.address.quarter
    },
    balcony: parseBoolean(realEstate.balcony),
    builtInKitchen: parseBoolean(realEstate.builtInKitchen)
  };
  if (realEstate.address.preciseHouseNumber) {
    processedEntry.address.houseNumber = ((realEstate.address
      .houseNumber: any): string); // eslint-disable-line flowtype/no-weak-types
  }
  return processedEntry;
}

function processFlatData(flatData: RawFlatData): FlatData {
  return {
    id: flatData.obj_scoutId,
    yearConstructed: parseInt(flatData.obj_yearConstructed, 10),
    floor: parseInt(flatData.obj_floor, 10),
    rent: {
      total: parseFloat(flatData.obj_totalRent),
      base: parseFloat(flatData.obj_baseRent),
      additional: parseFloat(flatData.obj_serviceCharge)
    },
    requiresWBS: flatData.additionalData.requiresWBS
  };
}

export const FLAT_ACTION = {
  APPLY: 'APPLY',
  INVESTIGATE: 'INVESTIGATE',
  NOTIFY_VIEWING_DATE: 'NOTIFY_VIEWING_DATE',
  IGNORE: 'IGNORE',
  DISCARD: 'DISCARD'
};
export type FlatAction = $Keys<typeof FLAT_ACTION>;

export const VERDICT_SCOPE = {
  OVERVIEW: 'OVERVIEW',
  COMPLETE: 'COMPLETE'
};
export type VerdictScope = $Keys<typeof VERDICT_SCOPE>;

export type Verdict = {
  configurationHash: number,
  result: boolean,
  scope: VerdictScope,
  reasons: Array<{
    reason: string,
    result: boolean
  }>,
  action?: FlatAction
};
export type Verdicts = { [key: string]: Verdict };

export type dataStateType = {|
  overview?: Array<OverviewDataEntry>,
  flat: { [key: string]: FlatData },
  verdicts: Verdicts
|};

const dataDefaultState: dataStateType = {
  verdicts: {},
  flat: {}
};

export default function data(
  state: dataStateType = dataDefaultState,
  action: Action
) {
  if (action.type === SET_OVERVIEW_DATA) {
    return Object.assign({}, state, {
      overview: action.payload.data.map(entry =>
        processOverviewDataEntry(entry)
      )
    });
  }

  if (action.type === SET_FLAT_DATA) {
    const flatData = processFlatData(action.payload.flatData);
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
