export const entrySelector = (entryId: string): string =>
  `[data-id="${entryId}"]`;
export const entryTitleSelector = (entryId: string): string =>
  `.result-list-entry__data a[data-exp-id="${entryId}"] > h2`;

export const composeMessageButtonSelector = '[data-qa="sendButton"]';

export const querySelectorsForApplicationForm = {
  messageTextarea: 'textarea#message',
  salutationField: 'select[name="salutation"]',
  firstNameField: 'input[name="firstName"]',
  lastNameField: 'input[name="lastName"]',
  emailField: 'input[name="emailAddress"]',
  phoneField: 'input[name="phoneNumber"]',
  streetField: 'input[name="street"]',
  houseNumberField: 'input[name="houseNumber"]',
  postCodeField: 'input[name="postcode"]',
  cityField: 'input[name="city"]',
  moveInDate: 'select[name="moveInDateType"]',
  numberOfPersons: 'select[name="numberOfPersons"',
  petsField: 'select[name="hasPets"]',
  petsDetailField: 'input[name="petsInHousehold"]',
  employmentField: 'select[name="employmentRelationship"]',
  incomeField: 'select[name="income"]',
  applicationPackageField: 'select[name="applicationPackageCompleted"]',
  submitButton: '#is24-expose-cosma-modal button[type="submit"]',
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
