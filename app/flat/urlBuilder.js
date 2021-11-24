import type { Configuration } from '../reducers/configuration';
import districts from '../map/districts';

const numberToUrlFloatString = (value: ?number): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return value.toFixed(1);
};

export function flatPageUrl(flatId: string): string {
  return `https://www.immobilienscout24.de/expose/${flatId}`;
}

export function generateSearchUrl(configuration: Configuration): string {
  const overlappingDistricts = districts.filter((district) =>
    district.postcodes.some((postcode) =>
      configuration.filter.postcodes.includes(postcode)
    )
  );

  let searchUrl = 'https://www.immobilienscout24.de/Suche/de/berlin/berlin';

  if (overlappingDistricts.length === 1) {
    searchUrl +=
      '/' +
      overlappingDistricts
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
  }

  searchUrl += `/wohnung-mieten?numberofrooms=${numberToUrlFloatString(
    configuration.filter.minimumRooms
  )}-${numberToUrlFloatString(
    configuration.filter.maximumRooms
  )}&livingspace=${numberToUrlFloatString(
    configuration.filter.minimumArea
  )}&pricetype=rentpermonth&price=-${numberToUrlFloatString(
    configuration.filter.maximumRent
  )}`;

  if (overlappingDistricts.length > 1) {
    searchUrl +=
      '&geocodes=' +
      overlappingDistricts
        .map((district) => district.geoNodeId.toString())
        .join(',');
  }

  // sort by date listed
  searchUrl += '&sorting=2';

  return searchUrl;
}
