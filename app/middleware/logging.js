// @flow

import type { Action, Dispatch, Store } from '../reducers/types';

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => (action: Action) => {
  console.log(action);

  next(action);
};
