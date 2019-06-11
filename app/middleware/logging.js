// @flow

import type { Action, Dispatch, Store } from '../reducers/types';

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => (action: Action) => {
  if (action.payload && JSON.stringify(action.payload).length > 100) {
    console.log(
      Object.assign({}, action, {
        payload: `${JSON.stringify(action.payload).substr(0, 100)}...`
      })
    );
  } else {
    console.log(action);
  }

  return next(action);
};
