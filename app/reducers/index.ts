import { combineReducers } from 'redux';
import { createReduxHistoryContext } from 'redux-first-history';
import type { HashHistory } from 'history';
import electron from './electron';
import overlay from './overlay';
import data from './data';
import configuration from './configuration';
import cache from './cache';
import scheduler from './scheduler';
import bot from './bot';
import { Store } from './types';

export default function createRootReducer(history: HashHistory) {
  const reducers: any = {
    electron,
    overlay,
    data,
    configuration,
    cache,
    scheduler,
    bot
  };

  if (history) {
    const { routerReducer } = createReduxHistoryContext({
      history
    });
    reducers.router = routerReducer;
  }

  return combineReducers<Store>(reducers);
}
