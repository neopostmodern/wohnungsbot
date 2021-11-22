import type { Configuration } from '../reducers/configuration';
import districts from '../map/districts';
import { numberToGermanFloatString } from '../utils/germanStrings';

export function flatPageUrl(flatId: string): string {
  return `https://www.immobilienscout24.de/expose/${flatId}`;
}

export function generateSearchUrl(configuration: Configuration): string {
  let searchUrl =
    'https://www.immobilienscout24.de/Suche/S-2/Wohnung-Miete/Berlin/Berlin/';
  const overlappingDistricts = districts.filter((district) =>
    district.postcodes.some((postcode) =>
      configuration.filter.postcodes.includes(postcode)
    )
  );

  if (overlappingDistricts.length <= 10) {
    searchUrl += overlappingDistricts
      .map((district) =>
        district.label
          .replace(/[()]/g, '')
          .replace(/ /g, '-')
          .replace(/ä/g, 'ae')
          .replace(/ö/g, 'oe')
          .replace(/ü/g, 'ue')
          .replace(/ß/g, 'ss')
      )
      .join('_');
  } else {
    searchUrl += overlappingDistricts
      .map((district) => (district.geoNodeId - 1276003001000).toString())
      .join('_');
  }

  searchUrl += `/${numberToGermanFloatString(
    configuration.filter.minimumRooms
  )}-${numberToGermanFloatString(
    configuration.filter.maximumRooms
  )}/${numberToGermanFloatString(
    configuration.filter.minimumArea
  )}-/EURO--${numberToGermanFloatString(configuration.filter.maximumRent)}`;

  // sort by date listed
  searchUrl += '?sorting=2';

  return searchUrl;
}
