import type { Action, Dispatch, Store } from '../reducers/types';
import type { targetType } from '../constants/targets';

const actions = {};

const registerAction = (type, action) => {
  actions[type] = action;
};

export function targetedAction<T>(
  type: string,
  target: targetType,
  action: (parameters: T) => Action
) {
  registerAction(type, action);
  return (payload: T) => ({
    type,
    payload,
    meta: {
      target
    }
  });
} // eslint-disable-next-line no-unused-vars

export default (target: targetType) =>
  (store: Store) =>
  (next: Dispatch) =>
  (action: Action) => {
    if (!action.meta || !action.meta.target) {
      return next(action);
    }

    if (action.meta.target !== target) {
      return;
    }

    const registeredAction = actions[action.type];

    if (registeredAction) {
      return store.dispatch(registeredAction(action.payload));
    }

    return next(action);
  };
