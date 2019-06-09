// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import electron from './electron';
import overlay from './overlay';
import data from './data';
import configuration from './configuration';
import cache from './cache';

export default function createRootReducer(history: History) {
  // eslint-disable-next-line flowtype/no-weak-types
  const reducers: any = {
    electron,
    overlay,
    data,
    configuration,
    cache
  };
  if (history) {
    reducers.router = connectRouter(history);
  }
  return combineReducers<{}, *>(reducers);
}
