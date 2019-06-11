// @flow
import type {
  AdditionalInformation,
  ContactData
} from '../reducers/configuration';
import {
  EMPLOYMENT_STATUS,
  MOVE_IN_WHEN,
  MOVE_IN_WHO,
  SALUTATIONS
} from '../reducers/configuration';
import { sleep } from '../utils/async';
import type { Dispatch } from '../reducers/types';
import {
  click,
  elementExists,
  fillText,
  getElementValue,
  pressKey
} from './botHelpers';

const SALUTATION_VALUES = {
  [SALUTATIONS.FRAU]: 'FEMALE',
  [SALUTATIONS.HERR]: 'MALE'
};

type BaseField = { selector: string };
type TextField = BaseField & { type: 'text', value: ?string };
type SelectField = BaseField & { type: 'select', value: string };
type AnyInputField = TextField | SelectField;
type FieldFillingDesciption = Array<AnyInputField>;
export const generatePersonalDataFormFillingDescription = (
  contactData: ContactData
): FieldFillingDesciption => [
  {
    selector: '#contactForm-salutation',
    type: 'select',
    value: SALUTATION_VALUES[contactData.salutation]
  },
  {
    selector: '#contactForm-firstName',
    type: 'text',
    value: contactData.firstName
  },
  {
    selector: '#contactForm-lastName',
    type: 'text',
    value: contactData.lastName
  },
  {
    selector: '#contactForm-emailAddress',
    type: 'text',
    value: contactData.eMail
  },
  {
    selector: '#contactForm-phoneNumber',
    type: 'text',
    value: contactData.telephone
  },
  {
    selector: '#contactForm-street',
    type: 'text',
    value: contactData.street
  },
  {
    selector: '#contactForm-houseNumber',
    type: 'text',
    value: contactData.houseNumber
  },
  {
    selector: '#contactForm-postcode',
    type: 'text',
    value: contactData.postcode
  },
  {
    selector: '#contactForm-city',
    type: 'text',
    value: contactData.city
  }
];

const MOVE_IN_WHEN_VALUES = {
  [MOVE_IN_WHEN.NOW]: 'FROM_NOW',
  [MOVE_IN_WHEN.FLEXIBLE]: 'FLEXIBLE'
};
const MOVE_IN_WHO_VALUES = {
  [MOVE_IN_WHO.SINGLE]: 'ONE_PERSON',
  [MOVE_IN_WHO.TWO_ADULTS]: 'TWO_PERSON',
  [MOVE_IN_WHO.FAMILY]: 'FAMILY',
  [MOVE_IN_WHO.SHARED_FLAT]: 'BIG_GROUP'
};
const EMPLOYMENT_STATUS_VALUES = {
  [EMPLOYMENT_STATUS.EMPLOYEE]: 'PUBLIC_EMPLOYEE',
  [EMPLOYMENT_STATUS.WORKER]: 'WORKER',
  [EMPLOYMENT_STATUS.SELF_EMPLOYED]: 'SELF_EMPLOYED',
  [EMPLOYMENT_STATUS.CIVIL_SERVANT]: 'OFFICER',
  [EMPLOYMENT_STATUS.TRAINEE]: 'TRAINEE',
  [EMPLOYMENT_STATUS.STUDENT]: 'STUDENT',
  [EMPLOYMENT_STATUS.PHD_STUDENT]: 'DOCTORAND',
  [EMPLOYMENT_STATUS.HOUSEPERSON]: 'HOUSEWIFE',
  [EMPLOYMENT_STATUS.UNEMPLOYED]: 'UNEMPLOYED',
  [EMPLOYMENT_STATUS.RETIRED]: 'RETIREE',
  [EMPLOYMENT_STATUS.OTHER]: 'OTHER'
};
const mapIncomeToValue = (income: ?number): string => {
  if (income === null || income === undefined) {
    console.error('No income has been defined.');
    return '';
  }
  if (income > 5000) {
    return 'OVER_5000';
  }
  if (income > 4000) {
    return 'OVER_4000_UPTO_5000';
  }
  if (income > 3000) {
    return 'OVER_3000_UPTO_4000';
  }
  if (income > 2000) {
    return 'OVER_2000_UPTO_3000';
  }
  if (income > 1500) {
    return 'OVER_1500_UPTO_2000';
  }
  if (income > 1000) {
    return 'OVER_1000_UPTO_1500';
  }
  if (income > 500) {
    return 'OVER_500_UPTO_1000';
  }
  return 'BELOW_500';
};

export const generateAdditionalDataFormFillingDescription = (
  additionalInformation: AdditionalInformation
): FieldFillingDesciption => [
  {
    selector: '#contactForm-moveInDateType',
    type: 'select',
    value: MOVE_IN_WHEN_VALUES[additionalInformation.moveInWhen]
  },
  {
    selector: '#contactForm-numberOfPersons',
    type: 'select',
    value: MOVE_IN_WHO_VALUES[additionalInformation.moveInWho]
  },
  {
    selector: '#contactForm-petsInHousehold',
    type: 'text',
    value: additionalInformation.animals
  },
  {
    selector: '#contactForm-employmentRelationship',
    type: 'select',
    value: EMPLOYMENT_STATUS_VALUES[additionalInformation.employmentStatus]
  },
  {
    selector: '#contactForm-income',
    type: 'select',
    value: mapIncomeToValue(additionalInformation.income)
  },
  {
    selector: '#contactForm-applicationPackageCompleted',
    type: 'select',
    value: additionalInformation.hasDocumentsReady.toString()
  }
];

export function fillForm(fieldFillingDescription: FieldFillingDesciption) {
  return async (dispatch: Dispatch) => {
    /* eslint-disable no-await-in-loop */
    // eslint-disable-next-line no-restricted-syntax
    for (const field of fieldFillingDescription) {
      // sometimes the fields don't exist - skip them
      if (!(await dispatch(elementExists(field.selector)))) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (field.type === 'text') {
        if (field.value) {
          await dispatch(fillText(field.selector, field.value));
          await sleep(1000);
        }
      } else if (field.type === 'select') {
        await dispatch(click(field.selector));
        await sleep(500);

        // need to close the pop-up such that each subsequent keystroke changes
        // the fields value immediately
        await dispatch(pressKey('Escape'));
        await sleep(500);

        while (
          (await dispatch(getElementValue(field.selector))) !== field.value
        ) {
          await dispatch(pressKey('Down'));
          await sleep(1000);
        }

        await sleep(1000);
      } else {
        console.error(`Unknown field type: ${field.type}`);
      }
    }
    /* eslint-enable no-await-in-loop */
  };
}
