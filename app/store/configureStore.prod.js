// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from '../reducers';
import type { stateType } from '../reducers/types';
import getHistory from './history';

function configureStore(isMain: boolean = false) {
  const middlewares = [thunk];

  const history = getHistory(isMain);

  if (!isMain) {
    middlewares.push(routerMiddleware(history));
  }

  const rootReducer = createRootReducer(history);
  const enhancer = applyMiddleware(...middlewares); // todo: electron-redux dependencies

  return createStore<*, stateType, *>(rootReducer, {}, enhancer);
}

export default configureStore;
