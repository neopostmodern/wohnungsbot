// @flow

import { shell } from 'electron';
import {
  electronRouting,
  setBrowserViewReady,
  setBrowserViewUrl
} from '../actions/electron';
import type { Action, Store } from '../reducers/types';
import type { electronStateType } from '../reducers/electron';
import { sleep } from '../utils/async';
import {
  ELECTRON_ROUTING,
  HIDE_CONFIGURATION,
  INTERNAL_ADD_BROWSER_VIEW,
  PERFORM_SCROLL,
  SET_BROWSER_WINDOW,
  SHOW_CONFIGURATION,
  SHOW_DEV_TOOLS
} from '../constants/actionTypes';
import {
  calculateOverviewBoundingBoxes,
  refreshBoundingBoxes
} from '../actions/overlay';
import { easeInOutCubic } from '../utils/easing';

function resizeViews(
  electronState: electronStateType,
  configurationVisibility: ?number = null
) {
  const {
    window,
    views: { puppet, sidebar, botOverlay, configuration, devMenu }
  } = electronState;
  if (window === undefined || window === null) {
    console.error('Main window not defined!');
    return;
  }

  const [windowWidth, windowHeight] = window.getSize();
  const sideBarWidth = Math.min(400, Math.round(windowWidth * 0.3));
  sidebar.browserView.setBounds({
    x: 0,
    y: 0,
    width: sideBarWidth,
    height: windowHeight
  });
  puppet.browserView.setBounds({
    x: sideBarWidth + 10,
    y: 10,
    width: windowWidth - sideBarWidth, // - 20, // by not subtracting the offset we push the scrollbar out of view
    height: windowHeight - 20
  });
  botOverlay.browserView.setBounds({
    x: sideBarWidth,
    y: 0,
    width: windowWidth - sideBarWidth,
    height: windowHeight
  });
  let configurationY = electronState.configurationHidden ? windowHeight : 0;
  if (
    configurationVisibility !== undefined &&
    configurationVisibility !== null
  ) {
    configurationY = Math.round(windowHeight * (1 - configurationVisibility));
  }
  configuration.browserView.setBounds({
    x: 0,
    y: configurationY,
    width: windowWidth,
    height: windowHeight
  });

  // only exists if in dev environment
  if (devMenu) {
    devMenu.browserView.setBounds({
      x: 0,
      y: windowHeight - 30,
      width: windowWidth,
      height: 30
    });
  }
}

export default (store: Store) => (next: (action: Action) => void) => async (
  action: Action
) => {
  if (action.type === ELECTRON_ROUTING) {
    const { name, targetUrl } = action.payload;
    store.dispatch(setBrowserViewReady(name, false));
    store.dispatch(setBrowserViewUrl(name, targetUrl));
    const viewState = store.getState().electron.views[name];
    if (viewState === undefined) {
      console.error(`No view registered for ${name}!`);
    } else {
      viewState.browserView.webContents.loadURL(targetUrl);
    }
  }

  if (action.type === INTERNAL_ADD_BROWSER_VIEW) {
    const { window } = store.getState().electron;
    if (window === undefined || window === null) {
      console.error('Main window not defined!');
      return;
    }

    const { name, browserView, initialUrl } = action.payload;

    browserView.webContents.on('did-finish-load', () => {
      store.dispatch(setBrowserViewReady(name, true));
    });
    browserView.webContents.on('new-window', (event, targetUrl) => {
      event.preventDefault();
      shell.openExternal(targetUrl);
    });
    browserView.webContents.on('did-navigate', (event, url) => {
      store.dispatch(setBrowserViewUrl(name, url));
    });

    if (initialUrl) {
      process.nextTick(() => store.dispatch(electronRouting(name, initialUrl)));
    }
  }

  if (action.type === SET_BROWSER_WINDOW) {
    const { window } = action.payload;
    window.on('resize', () => {
      const { electron } = store.getState();
      resizeViews(electron);
      if (electron.configurationHidden) {
        process.nextTick(() => store.dispatch(refreshBoundingBoxes()));
      }
    });
  }

  if (action.type === HIDE_CONFIGURATION) {
    const { searchUrl } = store.getState().configuration;
    store.dispatch(electronRouting('puppet', searchUrl));
  }

  if (
    action.type === HIDE_CONFIGURATION ||
    action.type === SHOW_CONFIGURATION
  ) {
    const animationSteps = 500;
    const electronState = store.getState().electron;
    for (let step = 0; step < animationSteps; step += 1) {
      resizeViews(
        electronState,
        easeInOutCubic(
          step,
          action.type === HIDE_CONFIGURATION ? 1 : 0,
          action.type === HIDE_CONFIGURATION ? -1 : 1,
          animationSteps
        )
      );
      // eslint-disable-next-line no-await-in-loop
      await sleep(5);
    }
  }

  if (action.type === PERFORM_SCROLL) {
    const {
      electron: { views }
    } = store.getState();

    await views[action.payload.name].browserView.webContents.executeJavaScript(
      `window.scrollBy(0, ${action.payload.deltaY});`
    );

    process.nextTick(() => store.dispatch(calculateOverviewBoundingBoxes()));
  }

  if (action.type === SHOW_DEV_TOOLS) {
    const {
      electron: { views }
    } = store.getState();
    const { webContents } = views[action.payload.name].browserView;

    if (webContents.isDevToolsOpened()) {
      webContents.closeDevTools();
    }

    webContents.openDevTools();
  }

  return next(action);
};
