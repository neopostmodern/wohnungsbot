import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { routerMiddleware, routerActions } from 'connected-react-router';
import { createLogger } from 'redux-logger';

import getHistory from './history';
import createRootReducer from '../reducers';
import type { stateType } from '../reducers/types';
import { MAIN, RENDERER, WEB } from '../constants/targets';
import overlay from '../middleware/overlay';
import logging from '../middleware/logging';
import configuration from '../middleware/configuration';
import data from '../middleware/data';
import scheduler from '../middleware/scheduler';
import bot from '../middleware/bot';
import login from '../middleware/login';

const configureStore = async (
  target: string,
  isDevelopment: boolean,
  initialState?: stateType
) => {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  let safeInitialState = initialState;
  if (target === RENDERER) {
    const { getInitialStateRenderer } = await import('electron-redux');
    safeInitialState = getInitialStateRenderer();
  }

  // Thunk Middleware
  middleware.push(thunk);

  const history = getHistory(target);

  // Router Middleware
  if (target === RENDERER || target === WEB) {
    const router = routerMiddleware(history);
    middleware.push(router);
  }
  // data extraction + routing + more
  if (target === MAIN) {
    const electron = (await import('../middleware/electron')).default;
    middleware.push(electron);
  }

  if (target === MAIN) {
    middleware.push(configuration);
    const persistence = (await import('../middleware/persistence')).default;
    middleware.push(persistence);
  }

  if (target === MAIN) {
    middleware.push(overlay);
  }

  if (target === MAIN) {
    middleware.push(bot);
  }

  if (target === MAIN) {
    middleware.push(data);
  }


  if (target === MAIN) {
    middleware.push(login);
  }

  if (target === MAIN) {
    const helpers = (await import('../middleware/helpers')).default;
    middleware.push(helpers);
  }

  const rootReducer = createRootReducer(history);

  // Redux DevTools Configuration
  const actionCreators = {
    ...routerActions
  };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    target === RENDERER &&
    isDevelopment &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          // Options: http://extension.remotedev.io/docs/API/Arguments.html
          actionCreators
        })
      : compose;
  /* eslint-enable no-underscore-dangle */

  if (target === MAIN) {
    middleware.unshift(scheduler);
  }

  // Logging Middleware
  if (isDevelopment) {
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
  }

  // Electron Redux
  if (target === MAIN) {
    const { forwardToRenderer } = await import('electron-redux');
    middleware.push(forwardToRenderer);
  }
  if (target === RENDERER) {
    const { forwardToMain } = await import('electron-redux');
    middleware.unshift(forwardToMain);
  }

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  // Create Store
  const store = createStore(rootReducer, safeInitialState, enhancer);

  if (target === MAIN) {
    const { replayActionMain } = await import('electron-redux');
    replayActionMain(store);
  }
  if (target === RENDERER) {
    const { replayActionRenderer } = await import('electron-redux');
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
