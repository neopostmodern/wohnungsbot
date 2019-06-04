// @flow

export default store => next => action => {
  console.log(action);

  next(action);
};
