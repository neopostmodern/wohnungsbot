// eslint-disable-next-line import/prefer-default-export
export const sleep = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds));
