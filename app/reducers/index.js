// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import electron from './electron';
import animations from './animations';
import data from './data';
import configuration from './configuration';

export default function createRootReducer(history: History) {
  // eslint-disable-next-line flowtype/no-weak-types
  const reducers: any = {
    electron,
    animations,
    data,
    configuration
  };
  if (history) {
    reducers.router = connectRouter(history);
  }
  return combineReducers<{}, *>(reducers);
}
