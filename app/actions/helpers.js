// @flow

import { SEND_MAIL } from '../constants/actionTypes';
import { MAIN } from '../constants/targets';

// eslint-disable-next-line import/prefer-default-export
export const sendMail = (to: string, subject: string, text: string) => ({
  type: SEND_MAIL,
  payload: { to, subject, text },
  meta: { target: MAIN }
});
