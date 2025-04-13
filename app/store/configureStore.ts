import { createStore, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
import { createReduxHistoryContext } from 'redux-first-history';
import { createLogger } from 'redux-logger';
import getHistory from './history';
import createRootReducer from '../reducers';
import { MAIN, RENDERER, WEB } from '../constants/targets';
import { logger } from '../utils/tracer-logger.js';

import overlay from '../middleware/overlay';
import configuration from '../middleware/configuration';
import data from '../middleware/data';
import scheduler from '../middleware/scheduler';
import bot from '../middleware/bot';
import login from '../middleware/login';
import { Store } from '../reducers/types';

const configureStore = async (target: string, isDevelopment: boolean) => {
  logger.trace(`target:${target} dev:${isDevelopment}`);
  // Redux Configuration
  const middleware = [];
  const enhancers = [];
  const history = getHistory(target);

  logger.info('Configure middleware...');

  // Thunk Middleware
  middleware.push(thunk);

  // Router Middleware
  if (target === RENDERER || target === WEB) {
    const { routerMiddleware } = createReduxHistoryContext({
      history
    });
    middleware.push(routerMiddleware);
  }

  // Main Middleware: data extraction + routing + more
  if (target === MAIN) {
    const electron = (await import('../middleware/electron')).default;
    middleware.push(electron);

    middleware.push(configuration);
    const persistence = (await import('../middleware/persistence')).default;
    middleware.push(persistence);

    middleware.push(overlay);

    middleware.push(bot);

    middleware.push(data);

    middleware.push(login);

    const helpers = (await import('../middleware/helpers')).default;
    middleware.push(helpers);

    middleware.unshift(scheduler);
  }

  // Logging Middleware
  if (target === RENDERER) {
    const logger = createLogger({
      level: isDevelopment ? 'debug' : 'info',
      collapsed: true
    });
    middleware.unshift(logger);
  } else if (target === MAIN) {
    const logging = (await import('../middleware/logging')).default;
    middleware.unshift(logging);
  }

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));

  logger.info('Configure enhancers...');

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

  logger.info('Configure reducers...');
  const rootReducer = createRootReducer(history);

  logger.info('Create store...');
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
