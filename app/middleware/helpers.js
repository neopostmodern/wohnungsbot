// @flow

import type { Action, Dispatch, Store } from '../reducers/types';
import { SEND_MAIL } from '../constants/actionTypes';
import sendMail from '../utils/email';

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => async (action: Action) => {
  if (action.type === SEND_MAIL) {
    const { to, subject, text } = action.payload;
    await sendMail(to, subject, text);
  }

  return next(action);
};
