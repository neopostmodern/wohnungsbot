import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createReduxHistoryContext } from 'redux-first-history';
import { createLogger } from 'redux-logger';
import getHistory from './history';
import createRootReducer from '../reducers';
import { MAIN, RENDERER, WEB } from '../constants/targets';

import overlay from '../middleware/overlay';
import configuration from '../middleware/configuration';
import data from '../middleware/data';
import scheduler from '../middleware/scheduler';
import bot from '../middleware/bot';
import login from '../middleware/login';
import { Store } from '../reducers/types';

const configureStore = async (target: string, isDevelopment: boolean) => {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];
  // Thunk Middleware
  middleware.push(thunk);
  const history = getHistory(target);

  // Router Middleware
  if (target === RENDERER || target === WEB) {
    const { routerMiddleware } = createReduxHistoryContext({
      history
    });
    middleware.push(routerMiddleware);
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

  if (target === MAIN) {
    middleware.unshift(scheduler);
  }

  // Logging Middleware
  if (target === RENDERER) {
    const logger = createLogger({
      level: isDevelopment ? 'info' : 'debug', // TODO GEORG use isDevelopment in pino logger.js
      collapsed: true
    });
    middleware.unshift(logger);
  }
  else if (target === MAIN) {
    const logging = (await import('../middleware/logging')).default;
    middleware.unshift(logging);
  }

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  // Electron Redux
  let composeEnhancers;

  if (target === MAIN) {
    const { composeWithStateSync } = await import('electron-redux/main');
    composeEnhancers = composeWithStateSync;
  } else if (target === RENDERER) {
    const { composeWithStateSync } = await import('electron-redux/renderer');
    composeEnhancers = composeWithStateSync;
  } else {
    composeEnhancers = compose;
  }

  const enhancer = composeEnhancers(...enhancers);
  // Create Store
  const store = createStore(rootReducer, enhancer) as Store; // todo: migrate away from deprecated Redux syntax, should fix TypeScript issues

  if (module.hot) {
    module.hot.accept(
      '../reducers', // eslint-disable-next-line global-require
      () => store.replaceReducer(require('../reducers').default)
    );
  }

  return store;
};

export default configureStore;
