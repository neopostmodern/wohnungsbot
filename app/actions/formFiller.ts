import type {
  AdditionalInformation,
  ContactData
} from '../reducers/configuration';
import {
  EmploymentStatus,
  MoveInWhen,
  MoveInWho,
  Salutations
} from '../reducers/configuration';
import { sleep } from '../utils/async';
import type { Dispatch } from '../reducers/types';
import type { ScrollIntoViewPolicy } from './botHelpers';
import { clickAction, pressKey, scrollIntoViewByPolicy } from './botHelpers';
import ElectronUtilsRedux from '../utils/electronUtilsRedux';
import AbortionSystem from '../utils/abortionSystem';
import electronObjects from '../store/electronObjects';

const Salutation_VALUES = {
  [Salutations.FRAU]: 'FEMALE',
  [Salutations.HERR]: 'MALE'
};
type BaseField = {
  selector: string;
  scrollIntoView?: ScrollIntoViewPolicy;
};
type TextField = BaseField & {
  type: 'text';
  value: string | null | undefined;
};
type SelectField = BaseField & {
  type: 'select';
  value: string;
};
type RadioField = BaseField & {
  type: 'radio';
  value: string;
};
type AnyInputField = TextField | SelectField | RadioField;
type FieldFillingDescription = Array<AnyInputField>;
export const generatePersonalDataFormFillingDescription = (
  contactData: ContactData,
  userIsLoggedIn: boolean = false
): FieldFillingDescription => {
  const fieldFillingDescription: FieldFillingDescription = [
    {
      selector: '#contactForm-salutation',
      type: 'select',
      value: Salutation_VALUES[contactData.salutation]
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
    }
  ];

  // the e-mail address field is read-only for logged in users
  if (!userIsLoggedIn) {
    fieldFillingDescription.push({
      selector: '#contactForm-emailAddress',
      type: 'text',
      value: contactData.eMail
    });
  }

  return fieldFillingDescription.concat([
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
  ]);
};
const MoveInWhen_VALUES = {
  [MoveInWhen.NOW]: 'FROM_NOW',
  [MoveInWhen.FLEXIBLE]: 'FLEXIBLE'
};
const MoveInWho_VALUES = {
  [MoveInWho.SINGLE]: 'ONE_PERSON',
  [MoveInWho.TWO_ADULTS]: 'TWO_PERSON',
  [MoveInWho.FAMILY]: 'FAMILY',
  [MoveInWho.SHARED_FLAT]: 'BIG_GROUP'
};
const EmploymentStatus_VALUES = {
  [EmploymentStatus.EMPLOYEE]: 'PUBLIC_EMPLOYEE',
  [EmploymentStatus.WORKER]: 'WORKER',
  [EmploymentStatus.SELF_EMPLOYED]: 'SELF_EMPLOYED',
  [EmploymentStatus.CIVIL_SERVANT]: 'OFFICER',
  [EmploymentStatus.TRAINEE]: 'TRAINEE',
  [EmploymentStatus.STUDENT]: 'STUDENT',
  [EmploymentStatus.PHD_STUDENT]: 'DOCTORAND',
  [EmploymentStatus.HOUSEPERSON]: 'HOUSEWIFE',
  [EmploymentStatus.UNEMPLOYED]: 'UNEMPLOYED',
  [EmploymentStatus.RETIRED]: 'RETIREE',
  [EmploymentStatus.OTHER]: 'OTHER'
};

const mapIncomeToValue = (income: number | null | undefined): string => {
  if (income === null || income === undefined) {
    // eslint-disable-next-line no-console
    console.error('No income has been defined.');
    return '';
  }

  if (income >= 5000) {
    return 'OVER_5000';
  }

  if (income >= 4000) {
    return 'OVER_4000_UPTO_5000';
  }

  if (income >= 3000) {
    return 'OVER_3000_UPTO_4000';
  }

  if (income >= 2000) {
    return 'OVER_2000_UPTO_3000';
  }

  if (income >= 1500) {
    return 'OVER_1500_UPTO_2000';
  }

  if (income >= 1000) {
    return 'OVER_1000_UPTO_1500';
  }

  if (income >= 500) {
    return 'OVER_500_UPTO_1000';
  }

  return 'BELOW_500';
};

export const generateAdditionalDataFormFillingDescription = (
  additionalInformation: AdditionalInformation
): FieldFillingDescription => [
  {
    selector: '#contactForm-moveInDateType',
    type: 'select',
    value: MoveInWhen_VALUES[additionalInformation.moveInWhen]
  },
  {
    selector: '#contactForm-numberOfPersons',
    type: 'select',
    value: MoveInWho_VALUES[additionalInformation.moveInWho]
  },
  {
    selector: '#contactForm-hasPets',
    type: 'select',
    value:
      additionalInformation.animals && additionalInformation.animals !== 'Keine'
        ? 'true'
        : 'false'
  },
  {
    selector: '#contactForm-personalData-petsInHousehold',
    type: 'text',
    value: additionalInformation.animals
  },
  {
    selector: '#contactForm-employmentRelationship',
    type: 'select',
    value: EmploymentStatus_VALUES[additionalInformation.employmentStatus]
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

async function fillSelectField(
  dispatch: Dispatch,
  electronUtils: ElectronUtilsRedux,
  field: SelectField,
  skipField = false
) {
  let sanitizedValue = field.value;

  if (skipField) {
    if (await electronUtils.getValue(field.selector)) {
      sanitizedValue = '';
    } else {
      return;
    }
  }

  // some macOS versions render select field pop-ups 'natively', making them
  // inaccessible to the keystrokes necessary to change the value –
  // thus on macOS the value is set directly via JavaScript
  if (process.platform === 'darwin') {
    await electronUtils.setValue(field.selector, sanitizedValue);
    await electronUtils.evaluate(
      `document.querySelector('${field.selector}')
                          .dispatchEvent(new Event('change', { 'bubbles': true, 'isTrusted': true }))`,
      true
    );
  } else {
    await dispatch(clickAction(field.selector));
    await sleep(500);
    // need to close the pop-up such that each subsequent keystroke changes
    // the fields value immediately
    await dispatch(pressKey('Escape'));
    await sleep(500);
    let previousValue = null;
    let down = true;

    /* eslint-disable no-await-in-loop */
    while (AbortionSystem.nestedFunctionsMayContinue) {
      const currentValue = await electronUtils.getValue(field.selector);

      if (currentValue === sanitizedValue) {
        break;
      }

      // switch direction if value stops changing
      if (previousValue && previousValue === currentValue) {
        down = !down;
      }

      previousValue = currentValue;
      await dispatch(pressKey(down ? 'Down' : 'Up'));
      await sleep(300);
    }
    /* eslint-enable no-await-in-loop */
  }

  await sleep(1000);
}

async function fillRadioField(
  dispatch: Dispatch,
  electronUtils: ElectronUtilsRedux,
  field: RadioField,
  skipField = false
) {
  const labelSelectorForRadio = (selector) => `${selector} ~ label`;

  if (skipField) {
    const selectedRadioSelector = `${field.selector} :checked`;

    if (await electronUtils.elementExists(selectedRadioSelector)) {
      // if the information shouldn't be submitted, but something is checked, click again to uncheck
      await dispatch(clickAction(labelSelectorForRadio(selectedRadioSelector)));
      await sleep(500);
    }

    return;
  }

  const radioButtonSelector = `${field.selector} [value="${field.value}"]`;

  if (await electronUtils.isElementChecked(radioButtonSelector)) {
    return;
  }

  await dispatch(clickAction(labelSelectorForRadio(radioButtonSelector)));
  await sleep(1200);
}

export function fillForm(
  fieldFillingDescription: FieldFillingDescription,
  fillAsLittleAsPossible: boolean = true
) {
  return async (dispatch: Dispatch) => {
    const { webContents } = electronObjects.views.puppet;
    const electronUtils = new ElectronUtilsRedux(webContents, dispatch);

    /* eslint-disable no-await-in-loop */
    // eslint-disable-next-line no-restricted-syntax
    for (const field of fieldFillingDescription) {
      // sometimes the fields don't exist or is hidden - skip them
      if (!(await electronUtils.elementExists(field.selector))) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // this is a way if the element was hidden (see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent)
      if (
        await electronUtils.evaluate(
          `document.querySelector('${field.selector}').offsetParent === null`
        )
      ) {
        // eslint-disable-next-line no-continue
        continue;
      }

      await scrollIntoViewByPolicy(webContents, field.selector, {
        scrollIntoViewPolicy: 'auto',
        overrideStrategy: 'center'
      });

      if ((await electronUtils.getValue(field.selector)) === field.value) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const optionalElementExistsById =
        field.selector.startsWith('#') &&
        (await electronUtils.elementExists(
          `.label-optional[for="${field.selector.substr(1)}"]`
        ));
      const optionalElementExistsByData =
        field.selector.startsWith('[data') &&
        (await electronUtils.elementExists(
          `${field.selector} .label-optional`
        ));
      const skipField =
        fillAsLittleAsPossible &&
        (optionalElementExistsById || optionalElementExistsByData);

      switch (field.type) {
        case 'text':
          if (skipField) {
            await electronUtils.fillText(field.selector, '');
            await sleep(300);
          } else if (field.value) {
            await electronUtils.fillText(field.selector, field.value);
            await sleep(1000);
          }
          break;
        case 'select':
          await fillSelectField(dispatch, electronUtils, field, skipField);
          break;
        case 'radio':
          await fillRadioField(dispatch, electronUtils, field, skipField);
          break;
      }
    }
    /* eslint-enable no-await-in-loop */
  };
}
