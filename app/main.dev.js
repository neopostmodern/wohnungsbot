/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import {
  app,
  BrowserWindow,
  BrowserView,
  type BrowserViewConstructorOptions
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import configureStore from './store/configureStore';
import { addView, setWindow } from './actions/electron';
import { MAIN } from './constants/targets';
import ROUTES from './constants/routes';
import { wakeUp } from './actions/infrastructure';
import type { BrowserViewName } from './reducers/electron';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
let firstLaunch = true;

const store = configureStore(MAIN);

let mainWindow: ?BrowserWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (isDevelopment) {
  require('electron-debug')();
}

// todo: extensions don't seem to load in BrowserView?
const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1000,
    height: 500,
    webPreferences: {
      // devTools: false
    }
  });

  store.dispatch(setWindow(mainWindow));

  const newView = (
    name: BrowserViewName,
    options: BrowserViewConstructorOptions,
    initialUrl: string
  ): BrowserView => {
    if (mainWindow === undefined || mainWindow === null) {
      console.error('Main window not defined!');
      return;
    }

    const browserView = new BrowserView(options);
    mainWindow.addBrowserView(browserView);
    store.dispatch(addView(name, browserView, initialUrl));
    return browserView;
  };

  newView(
    'sidebar',
    {
      webPreferences: {
        nodeIntegration: true
      }
    },
    `file://${__dirname}/app.html#${ROUTES.SIDEBAR}`
  );
  newView(
    'puppet',
    {
      webPreferences: {
        sandbox: true
      }
    },
    // todo: create landingpage
    'https://example.com/'
  );

  newView(
    'botOverlay',
    {
      webPreferences: {
        nodeIntegration: true
      },
      transparent: true
    },
    `file://${__dirname}/app.html#${ROUTES.BOT_OVERLAY}`
  );

  const configurationView = newView(
    'configuration',
    {
      webPreferences: {
        nodeIntegration: true
      },
      transparent: true
    },
    `file://${__dirname}/app.html#${ROUTES.CONFIGURATION}`
  );

  if (isDevelopment) {
    newView(
      'devMenu',
      {
        webPreferences: {
          nodeIntegration: true,
          experimentalFeatures: true
        },
        transparent: true
      },
      `file://${__dirname}/app.html#${ROUTES.DEV_MENU}`
    );
  }

  configurationView.webContents.on('did-finish-load', () => {
    if (mainWindow === undefined || mainWindow === null) {
      console.error('Main window not defined!');
      return;
    }

    store.dispatch(wakeUp());

    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
    if (!mainWindow.isMaximized()) {
      mainWindow.maximize();
    }

    if (firstLaunch) {
      configurationView.webContents.focus();
      firstLaunch = false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.setMenuBarVisibility(false);

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
});
