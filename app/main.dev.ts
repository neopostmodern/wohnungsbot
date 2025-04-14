/* eslint global-require: off */
import type { WebPreferences } from 'electron';
import { app, screen, BrowserWindow, WebContentsView } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import configureStore from './store/configureStore';
import {
  addView,
  setAvailableVersion,
  setUpdateDownloadProgress,
  setWindow
} from './actions/electron';
import { MAIN } from './constants/targets';
import ROUTES from './constants/routes';
import { LOADING, UP_TO_DATE } from './constants/updater';
import { wakeUp } from './actions/infrastructure';
import type { BrowserViewName } from './reducers/electron';
import getRandomUserAgent from './utils/randomUserAgent';
import electronObjects from './store/electronObjects';
import resizeViews from './utils/resizeViews';

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
let isLaunching = true;

// TODO refactor: one function, doing init and taking the two callbacks
export default class AppUpdater {
  static init() {
    if (isDevelopment) {
      log.transports.file.level = 'info';
      autoUpdater.logger = log;
    }

    autoUpdater.checkForUpdatesAndNotify();
  }

  static onUpdateAvailable(callback: (version: string) => void) {
    autoUpdater.on('checking-for-update', () => {
      callback(LOADING);
    });
    autoUpdater.on('update-available', ({ version }) => {
      callback(version);
    });
    autoUpdater.on('update-not-available', () => {
      callback(UP_TO_DATE);
    });
  }

  static onDownloadProgress(callback: (percentage: number) => void) {
    autoUpdater.on('download-progress', ({ percent }) => {
      callback(percent);
    });
    autoUpdater.on('update-downloaded', () => {
      callback(100);
    });
  }
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');

  sourceMapSupport.install();
}

if (isDevelopment) {
  require('electron-debug')();
}

configureStore(MAIN, isDevelopment) // eslint-disable-next-line promise/always-return
  .then((store) => {
    let mainWindow: BrowserWindow | null | undefined = null;

    // todo: extensions don't seem to load in BrowserView?
    const installExtensions = async () => {
      const installer = require('electron-devtools-installer');

      const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
      const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
      /* eslint-disable promise/no-nesting */
      return Promise.all(
        extensions.map((name) =>
          installer.default(installer[name], forceDownload)
        )
      ).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`Problem installing extensions: ${error}`);
      });
      /* eslint-enable promise/no-nesting */
    };

    /**
     * Add event listeners...
     */
    app.on('window-all-closed', () => {
      app.quit();
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
        width: Math.min(1200, screen.getPrimaryDisplay().workAreaSize.width),
        height: Math.min(800, screen.getPrimaryDisplay().workAreaSize.height),
        titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default'
      });
      electronObjects.window = mainWindow;
      store.dispatch(setWindow());

      const newView = (
        name: BrowserViewName,
        options: WebPreferences,
        initialUrl: string,
        { logConsoleErrors = true }: { logConsoleErrors?: boolean } = {}
      ): WebContentsView => {
        if (mainWindow === undefined || mainWindow === null) {
          throw Error('Main window not defined!');
        }

        const view = new WebContentsView({ webPreferences: options });
        if (logConsoleErrors) {
          view.webContents.on(
            'console-message',
            ({ level, message, line, sourceId }: any) => {
              if (level === 'error') {
                console.error(
                  `Forwarded from browser view (${name}): ${message}`,
                  {
                    browserView: name,
                    line,
                    sourceId
                  }
                );
              }
            }
          );
        }

        if (name === 'configuration' || name === 'print') {
          view.webContents.toggleDevTools();
        }
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
        `file://${__dirname}/app.html#${ROUTES.PLACEHOLDER}`,
        { logConsoleErrors: false }
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

      configurationView.webContents.on('did-finish-load', () => {
        if (mainWindow === undefined || mainWindow === null) {
          // eslint-disable-next-line no-console
          console.error('Main window not defined!');
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
      });
      mainWindow.on('closed', () => {
        mainWindow = null;
      });
      mainWindow.setMenuBarVisibility(false);

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
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });
