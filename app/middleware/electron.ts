import { shell } from "electron";
import { electronRouting, setBrowserViewReady, setBrowserViewUrl } from "../actions/electron";
import type { Action, Store } from "../reducers/types";
import { sleep } from "../utils/async";
import { ELECTRON_ROUTING, HIDE_CONFIGURATION, INTERNAL_ADD_BROWSER_VIEW, OPEN_PDF, PERFORM_SCROLL, SCROLL_WHILE_IDLE, SET_BROWSER_WINDOW, SET_INTERACTIVE_MODE, SHOW_CONFIGURATION, SHOW_DEV_TOOLS, STOP_SCROLLING_WHILE_IDLE } from "../constants/actionTypes";
import { calculateOverviewBoundingBoxes, refreshBoundingBoxes } from "../actions/overlay";
import { easeInOutCubic } from "../utils/easing";
import resizeViews from "../utils/resizeViews";
import scrollWhileIdle from "../utils/scrollWhileIdle";
import ElectronUtils from "../utils/electronUtils";
import { login } from "../actions/bot";
import { electronObjects } from "../store/electronObjects";
let stopScrollingWhileIdle;
export default ((store: Store) => (next: (action: Action) => void) => async (action: Action) => {
  if (action.type === ELECTRON_ROUTING) {
    const {
      name,
      targetUrl
    } = action.payload;
    store.dispatch(setBrowserViewReady(name, false));
    store.dispatch(setBrowserViewUrl(name, targetUrl));
    const browserView = electronObjects.views[name];

    if (browserView === undefined) {
      // eslint-disable-next-line no-console
      console.error(`No view registered for ${name}!`);
    } else {
      browserView.webContents.loadURL(targetUrl);
    }
  }

  if (action.type === INTERNAL_ADD_BROWSER_VIEW) {
    const {
      window
    } = electronObjects;

    if (window === undefined || window === null) {
      // eslint-disable-next-line no-console
      console.error('Main window not defined!');
      return;
    }

    const {
      name,
      initialUrl
    } = action.payload;
    const browserView = electronObjects.views[name];
    browserView.webContents.on('did-finish-load', () => {
      store.dispatch(setBrowserViewReady(name, true));
    });
    browserView.webContents.setWindowOpenHandler(details => {
      shell.openExternal(details.url);
      return {
        action: 'deny'
      };
    });
    browserView.webContents.on('did-navigate', (event, url) => {
      store.dispatch(setBrowserViewUrl(name, url));
    });

    if (initialUrl) {
      process.nextTick(() => store.dispatch(electronRouting(name, initialUrl)));
    }
  }

  if (action.type === SET_BROWSER_WINDOW) {
    const {
      window
    } = electronObjects;

    const adjustViewSizes = () => {
      const {
        electron
      } = store.getState();
      resizeViews(electron);

      if (electron.configurationHidden) {
        process.nextTick(() => store.dispatch(refreshBoundingBoxes()));
      }
    };

    window.on('resize', adjustViewSizes);
    // cause views to be adjusted/placed upon launch
    setImmediate(adjustViewSizes);
  }

  if (action.type === HIDE_CONFIGURATION) {
    const {
      immobilienScout24
    } = store.getState().configuration;
    store.dispatch(login(immobilienScout24));
  }

  if (action.type === HIDE_CONFIGURATION || action.type === SHOW_CONFIGURATION) {
    const animationSteps = 500;
    const electronState = store.getState().electron;

    for (let step = 0; step < animationSteps; step += 1) {
      resizeViews(electronState, easeInOutCubic(step, action.type === HIDE_CONFIGURATION ? 1 : 0, action.type === HIDE_CONFIGURATION ? -1 : 1, animationSteps));
      // eslint-disable-next-line no-await-in-loop
      await sleep(5);
    }
  }

  if (action.type === SET_INTERACTIVE_MODE) {
    setImmediate(() => resizeViews(store.getState().electron));
  }

  if (action.type === PERFORM_SCROLL) {
    const electronUtils = new ElectronUtils(electronObjects.views[action.payload.name].webContents);
    await electronUtils.scrollBy(0, action.payload.deltaY);
    process.nextTick(() => store.dispatch(calculateOverviewBoundingBoxes()));
  }

  if (action.type === SCROLL_WHILE_IDLE) {
    if (stopScrollingWhileIdle) {
      // stop any previous instance
      stopScrollingWhileIdle();
    }

    stopScrollingWhileIdle = scrollWhileIdle(store.getState, store.dispatch);
  }

  if (action.type === STOP_SCROLLING_WHILE_IDLE) {
    if (!stopScrollingWhileIdle) {
      throw Error("Can't stop scrolling before it was started");
    }

    stopScrollingWhileIdle();
    stopScrollingWhileIdle = null;
  }

  if (action.type === SHOW_DEV_TOOLS) {
    const {
      webContents
    } = electronObjects.views[action.payload.name];

    if (webContents.isDevToolsOpened()) {
      webContents.closeDevTools();
    }

    webContents.openDevTools();
  }

  if (action.type === OPEN_PDF) {
    shell.openPath(action.payload.pdfPath);
  }

  return next(action);
});