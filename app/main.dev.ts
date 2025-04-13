/* eslint global-require: off */
import type { WebPreferences } from 'electron';
import { app, screen, BrowserWindow, WebContentsView } from 'electron';

import AppUpdater from './AppUpdater';
import { logger } from './utils/tracer-logger.js';
import configureStore from './store/configureStore';
import {
  addView,
  setAvailableVersion,
  setUpdateDownloadProgress,
  setWindow
} from './actions/electron';
import { MAIN } from './constants/targets';
import ROUTES from './constants/routes';
import { wakeUp } from './actions/infrastructure';
import type { BrowserViewName } from './reducers/electron';
import getRandomUserAgent from './utils/randomUserAgent';
import electronObjects from './store/electronObjects';
import resizeViews from './utils/resizeViews';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const enableDebug = process.env.ENABLE_DEBUG === 'true';
const enableDevtools = isDevelopment || enableDebug;
logger.info(
  `ENVIRONMENT prod:${isProduction} dev:${isDevelopment} debug:${enableDebug} tools:${enableDevtools}`
);

let isLaunching = true;

if (isProduction) {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

// TODO: dedup this with the installExtensions()
if (enableDevtools) {
  require('electron-debug')();
}

// todo: extensions don't seem to load in BrowserView?
const installExtensions = async () => {
  logger.trace();
  const installer = require('electron-devtools-installer');

  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
  /* eslint-disable promise/no-nesting */
  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch((error) => {
    logger.error(`Problem installing extensions: ${error}`);
  });
  /* eslint-enable promise/no-nesting */
};

const appOnWindowAllClosed = async () => {
  logger.trace();
  app.quit();
};

const appOnReady = async (store) => {
  logger.trace();
  let mainWindow: BrowserWindow | null | undefined = null;

  /* Do things depending on environment variables... */

  if (enableDevtools) {
    await installExtensions();
  }

  /* Initialize views... */
  logger.info('Initialize views...');

  mainWindow = new BrowserWindow({
    show: false,
    width: Math.min(1200, screen.getPrimaryDisplay().workAreaSize.width),
    height: Math.min(800, screen.getPrimaryDisplay().workAreaSize.height),
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default'
  });
  electronObjects.window = mainWindow;
  store.dispatch(setWindow());

  const newView = (
    name: BrowserViewName,
    options: WebPreferences,
    initialUrl: string
  ): WebContentsView => {
    logger.trace(`name:${name}`);
    logger.log(`initialUrl:${initialUrl}`);
    logger.log('options:', options);
    if (mainWindow === undefined || mainWindow === null) {
      throw Error('Main window not defined!');
    }

    const view = new WebContentsView({ webPreferences: options });
    mainWindow.contentView.addChildView(view);
    electronObjects.views[name] = view;
    store.dispatch(addView(name, initialUrl));
    return view;
  };

      newView(
        'sidebar',
        {
          nodeIntegration: true,
          contextIsolation: false,
          preload: `${__dirname}/preload.js`
        },
        `file://${__dirname}/app.html#${ROUTES.SIDEBAR}`
      );
      newView(
        'print',
        {
          sandbox: true,
          contextIsolation: true
        },
        `file://${__dirname}/app.html#${ROUTES.PLACEHOLDER}`
      );
      const puppetView = newView(
        'puppet',
        {
          sandbox: true,
          contextIsolation: true
        },
        `file://${__dirname}/app.html#${ROUTES.PLACEHOLDER}`
      );
      puppetView.webContents.setUserAgent(getRandomUserAgent());
      newView(
        'botOverlay',
        {
          nodeIntegration: true,
          experimentalFeatures: true,
          contextIsolation: false,
          preload: `${__dirname}/preload.js`,
          transparent: true
        },
        `file://${__dirname}/app.html#${ROUTES.BOT_OVERLAY}`
      );
      const configurationView = newView(
        'configuration',
        {
          nodeIntegration: true,
          contextIsolation: false,
          preload: `${__dirname}/preload.js`,
      transparent: true
    },
    `file://${__dirname}/app.html#${ROUTES.CONFIGURATION}`
  );

      if (isDevelopment) {
        newView(
          'devMenu',
          {
            nodeIntegration: true,
            experimentalFeatures: true,
            contextIsolation: false,
            preload: `${__dirname}/preload.js`,
        transparent: true
      },
      `file://${__dirname}/app.html#${ROUTES.DEV_MENU}`
    );
  }

  /* Add event listeners... */
  logger.info('Add event listeners...');

  const configurationViewDidFinishLoad = async () => {
    logger.trace();
    if (mainWindow === undefined || mainWindow === null) {
      logger.error('Main window not defined!');
      return;
    }

    store.dispatch(wakeUp());

    if (!mainWindow.isVisible()) {
      mainWindow.show();
      // resize again, sometimes it only works after the window is visible
      resizeViews({
        interactiveMode: false
      });
    }

    if (isLaunching) {
      configurationView.webContents.focus();
      isLaunching = false;
    }
  };
  configurationView.webContents.on('did-finish-load', () =>
    configurationViewDidFinishLoad()
  );

  const mainWindowOnClosed = async (store) => {
    logger.trace();
    mainWindow = null;
  };
  mainWindow.on('closed', () => mainWindowOnClosed());
  mainWindow.setMenuBarVisibility(false);

  logger.info('Initialize AppUpdater...');
  AppUpdater.init();
  AppUpdater.onUpdateAvailable((version) => {
    store.dispatch(setAvailableVersion(version));

    // no auto-update on macOS
    if (process.platform === 'darwin') {
      store.dispatch(setUpdateDownloadProgress(-1));
    }
  });
  AppUpdater.onDownloadProgress((percentage) => {
    store.dispatch(setUpdateDownloadProgress(percentage));
  });
  logger.trace('DONE');
};

const configureStoreThen = async (store) => {
  logger.trace();
  app.on('window-all-closed', () => appOnWindowAllClosed());
  app.on('ready', () => appOnReady(store));
};

configureStore(MAIN, isDevelopment) // eslint-disable-next-line promise/always-return
  .then((store) => configureStoreThen(store))
  .catch((error) => {
    logger.error(error);
  });
