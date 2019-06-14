// @flow
import APPLICATION_TEMPLATES from '../constants/applicationTemplates';
import type { FlatAddress, FlatContactDetails } from '../reducers/data';

function generateSalutation(contactData: FlatContactDetails): string {
  let salutation = 'Sehr geehrte';
  if (contactData.lastName && contactData.salutation === 'MALE') {
    salutation += `r Herr ${contactData.lastName}`;
  } else if (contactData.lastName && contactData.salutation === 'FEMALE') {
    salutation += ` Frau ${contactData.lastName}`;
  } else {
    salutation += ' Damen und Herren';
  }

  return salutation;
}

const streetNamePrepositions = [
  {
    suffixes: ['platz', 'pl.', 'damm', 'ufer'],
    preposition: 'am'
  },
  {
    suffixes: ['allee', 'promenade', 'hasenheide'],
    preposition: 'an der'
  },
  {
    suffixes: ['weg', 'steig', 'grund'],
    preposition: 'im'
  }
];

function getStreetPrefix(street: string): string {
  if (street.toLowerCase().startsWith('am ')) {
    return '';
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const streetNamePreposition of streetNamePrepositions) {
    // eslint-disable-next-line no-restricted-syntax
    for (const suffix of streetNamePreposition.suffixes) {
      if (street.toLowerCase().endsWith(suffix)) {
        return streetNamePreposition.preposition;
      }
    }
  }

  // works for "Straße" and hopefully other cases
  return 'in der';
}

export function generateInPlaceDescription(address: FlatAddress): string {
  const { street, neighborhood } = address;
  if (street !== undefined && street !== null) {
    return `${getStreetPrefix(street)} ${street
      .replace(/str\./, 'straße')
      .replace(/Str\./, 'Straße')
      .replace(/pl\./, 'platz')
      .replace(/Pl\./, 'Platz')}`;
  }
  return `in ${neighborhood}`;
}

export default function applicationTextBuilder(
  template: string,
  address: FlatAddress,
  contactData: FlatContactDetails
): string {
  let applicationText = template;

  applicationText = applicationText
    .replace(APPLICATION_TEMPLATES.SALUTATION, generateSalutation(contactData))
    .replace(
      APPLICATION_TEMPLATES.IN_PLACE,
      generateInPlaceDescription(address)
    )
    .replace(APPLICATION_TEMPLATES.NEIGHBORHOOD, address.neighborhood);

  return applicationText;
}
