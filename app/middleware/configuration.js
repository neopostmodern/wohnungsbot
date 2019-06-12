// @flow

import { setSearchUrl } from '../actions/configuration';
import { refreshVerdicts } from '../actions/data';
import type { Action, Dispatch, Store } from '../reducers/types';
import { SET_SEARCH_URL } from '../constants/actionTypes';
import type { Configuration } from '../reducers/configuration';
import districts from '../map/districts';
import { numberToGermanFloatString } from '../utils/germanStrings';
import { getConfigurationFilterHash } from '../reducers/configuration';

function generateSearchUrl(configuration: Configuration): string {
  let searchUrl =
    'https://www.immobilienscout24.de/Suche/S-2/Wohnung-Miete/Berlin/Berlin/';
  const overlappingDistricts = districts.filter(district =>
    district.postcodes.some(postcode =>
      configuration.filter.postcodes.includes(postcode)
    )
  );

  if (overlappingDistricts.length <= 10) {
    searchUrl += overlappingDistricts
      .map(district =>
        district.label
          .replace('(', '-')
          .replace(/[) ]/g, '')
          .replace(/ä/g, 'ae')
          .replace(/ö/g, 'oe')
          .replace(/ü/g, 'ue')
          .replace(/ß/g, 'ss')
      )
      .join('_');
  } else {
    searchUrl += overlappingDistricts
      .map(district => (district.geoNodeId - 1276003001000).toString())
      .join('_');
  }

  searchUrl += `/${numberToGermanFloatString(
    configuration.filter.minimumRooms
  )}-${numberToGermanFloatString(
    configuration.filter.maximumRooms
  )}/${numberToGermanFloatString(
    configuration.filter.minimumArea
  )}-/EURO--${numberToGermanFloatString(configuration.filter.maximumRent)}`;

  return searchUrl;
}

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => (action: Action) => {
  if (!action.meta || !action.meta.configuration) {
    return next(action);
  }

  const filterBeforeUpdate = getConfigurationFilterHash(
    store.getState().configuration
  );

  const result = next(action);

  if (
    getConfigurationFilterHash(store.getState().configuration) !==
    filterBeforeUpdate
  ) {
    store.dispatch(refreshVerdicts());

    if (action.type !== SET_SEARCH_URL) {
      process.nextTick(() => {
        store.dispatch(
          setSearchUrl(generateSearchUrl(store.getState().configuration))
        );
      });
    }
  }

  return result;
};
