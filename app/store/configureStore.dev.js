import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { routerMiddleware, routerActions } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import {
  forwardToMain,
  forwardToRenderer,
  replayActionMain,
  replayActionRenderer,
  getInitialStateRenderer
} from 'electron-redux';

import getHistory from './history';
import createRootReducer from '../reducers';
import { MAIN, RENDERER } from '../constants/targets';
import targetFilter from '../middleware/targetFilter';
import overlay from '../middleware/overlay';
import logging from '../middleware/logging';
import electron from '../middleware/electron';
import configuration from '../middleware/configuration';
import data from '../middleware/data';
import * as counterActions from '../actions/electron';
import type { stateType } from '../reducers/types';

const configureStore = (target: string, initialState?: stateType) => {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  const safeInitialState =
    target === MAIN ? initialState : getInitialStateRenderer();

  // Thunk Middleware
  middleware.push(thunk);

  // Logging Middleware
  if (target === RENDERER) {
    const logger = createLogger({
      level: 'info',
      collapsed: true
    });

    // Skip redux logs in console during the tests
    if (process.env.NODE_ENV !== 'test') {
      middleware.push(logger);
    }
  }
  if (target === MAIN) {
    middleware.unshift(logging);
  }

  const history = getHistory(target);

  // Router Middleware
  if (target === RENDERER) {
    const router = routerMiddleware(history);
    middleware.push(router);
  }
  // data extraction + routing + more
  if (target === MAIN) {
    middleware.push(electron);
  }

  if (target === MAIN) {
    middleware.push(configuration);
  }

  if (target === RENDERER) {
    middleware.push(overlay);
  }

  if (target === MAIN) {
    middleware.push(data);
  }

  const rootReducer = createRootReducer(history);

  // Redux DevTools Configuration
  const actionCreators = {
    ...counterActions,
    ...routerActions
  };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    target === RENDERER && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          // Options: http://extension.remotedev.io/docs/API/Arguments.html
          actionCreators
        })
      : compose;
  /* eslint-enable no-underscore-dangle */

  // Electron Redux
  middleware.unshift(targetFilter(target));
  if (target === MAIN) {
    middleware.push(forwardToRenderer);
  }
  if (target === RENDERER) {
    middleware.unshift(forwardToMain);
  }

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  // Create Store
  const store = createStore(rootReducer, safeInitialState, enhancer);

  if (target === MAIN) {
    replayActionMain(store);
  }
  if (target === RENDERER) {
    replayActionRenderer(store);
  }

  if (module.hot) {
    module.hot.accept(
      '../reducers',
      // eslint-disable-next-line global-require
      () => store.replaceReducer(require('../reducers').default)
    );
  }

  return store;
};

export default configureStore;
