import type { Configuration } from '../reducers/configuration';
import districts from '../map/districts.json';

const numberToUrlFloatString = (value: number | null | undefined): string => {
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
  let searchUrl =
    'https://www.immobilienscout24.de/Suche/de/berlin/berlin/wohnung-mieten' +
    `?numberofrooms=${numberToUrlFloatString(
      configuration.filter.minimumRooms
    )}-${numberToUrlFloatString(configuration.filter.maximumRooms)}${
      configuration.filter.minimumArea
        ? `&livingspace=${numberToUrlFloatString(
            configuration.filter.minimumArea
          )}-`
        : ''
    }&pricetype=rentpermonth&price=-${numberToUrlFloatString(
      configuration.filter.maximumRent
    )}&geocodes=${overlappingDistricts
      .map((district) => district.geoNodeId.toString())
      .join(',')}`;

  if (configuration.filter.noSwapApartment) {
    searchUrl += '&exclusioncriteria=swapflat';
  }

  const equipment = [];

  if (configuration.filter.mustHaveBalcony) {
    equipment.push('balcony');
  }

  if (configuration.filter.mustHaveKitchenette) {
    equipment.push('builtinkitchen');
  }

  if (equipment.length > 0) {
    searchUrl += `&equipment=${equipment.join(',')}`;
  }

  if (!configuration.filter.hasWBS) {
    searchUrl += '&haspromotion=false';
  }
  searchUrl += '&viewMode=LIST';

  return searchUrl;
}
