// @flow

import dotProp from 'dot-prop-immutable';
import type { Action } from './types';
import { DATA_OVERVIEW_SET, SET_VERDICT } from '../constants/actionTypes';

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

export type Verdict = {
  result: boolean,
  reasons: Array<{
    reason: string,
    result: boolean
  }>
};
export type Verdicts = { [key: string]: Verdict };

export type dataStateType = {|
  overview?: Array<OverviewDataEntry>,
  verdicts: Verdicts
|};

const dataDefaultState: dataStateType = {
  verdicts: {}
};

export default function data(
  state: dataStateType = dataDefaultState,
  action: Action
) {
  if (action.type === DATA_OVERVIEW_SET) {
    return Object.assign({}, state, {
      overview: action.payload.data.map(entry =>
        processOverviewDataEntry(entry)
      )
    });
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
