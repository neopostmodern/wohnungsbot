export const entrySelector = (entryId: string): string =>
  `[data-id="${entryId}"]`;
export const entryTitleSelector = (entryId: string): string =>
  `.result-list-entry__data a[data-exp-id="${entryId}"] > h2`;

export const composeMessageButtonSelector = '[data-qa="sendButton"]';

export const querySelectorsForApplicationForm = {
  messageTextarea: '#contactForm-Message',
  salutationField: '#contactForm-salutation',
  firstNameField: '#contactForm-firstName',
  lastNameField: '#contactForm-lastName',
  emailField: '#contactForm-emailAddress',
  phoneField: '#contactForm-phoneNumber',
  streetField: '#contactForm-street',
  houseNumberField: '#contactForm-houseNumber',
  postCodeField: '#contactForm-postcode',
  cityField: '#contactForm-city',
  moveInDate: '#contactForm-moveInDateType',
  numberOfPersons: '#contactForm-numberOfPersons',
  petsField: '#contactForm-hasPets',
  petsDetailField: '#contactForm-personalData-petsInHousehold',
  employmentField: '#contactForm-employmentRelationship',
  incomeField: '#contactForm-income',
  applicationPackageField: '#contactForm-applicationPackageCompleted',
  privacyPolicyCheckbox: '#contactForm-privacyPolicyAccepted',
  submitButton: '#is24-expose-modal .button-primary',
  submitButtonContent: 'Abschicken',
  saveDataButton: '[data-qa="saveProfileButton"]',
  saveDataButtonContent: 'Daten speichern'
};

export const querySelectorsForCookiePopup = {
  popupRoot: '#usercentrics-root',
  popupContainer: '#uc-center-container',
  cookieCustomizeButton: '[data-testid="uc-customize-button"]',
  cookieDenyAllButton: '[data-testid="uc-deny-all-button"]'
};

export default querySelectorsForApplicationForm;
