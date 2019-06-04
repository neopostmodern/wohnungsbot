// @flow

const actions = {};
const registerAction = (type, action) => {
  actions[type] = action;
};

export function targetedAction(type, target, action) {
  registerAction(type, action);

  return () => ({
    type,
    payload: null,
    meta: {
      target
    }
  });
}

export default target => store => next => action => {
  if (!action.meta || !action.meta.target) {
    return next(action);
  }

  if (action.meta.target !== target) {
    console.log(`Killed action: ${action}`);
    return;
  }

  const registeredAction = actions[action.type];
  if (registeredAction) {
    next(registeredAction(next));
  }

  next(action);
};
