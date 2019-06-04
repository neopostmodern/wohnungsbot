// @flow

import { shell } from 'electron';
import {
  dataOverviewSet,
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
  SET_BROWSER_VIEW_READY,
  SET_BROWSER_WINDOW,
  SHOW_CONFIGURATION
} from '../constants/actionTypes';

function resizeViews(
  electronState: electronStateType,
  configurationVisibility: ?number = null
) {
  const {
    window,
    views: { puppet, sidebar, botOverlay, configuration }
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
    width: windowWidth - sideBarWidth - 20,
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
}

// credit: https://github.com/danro/jquery-easing/blob/master/jquery.easing.js#L38
/* eslint-disable */
const easeInOutCubic = (currentTime, startValue, valueChange, duration) => {
  if ((currentTime /= duration / 2) < 1)
    return (
      (valueChange / 2) * currentTime * currentTime * currentTime + startValue
    );
  return (
    (valueChange / 2) * ((currentTime -= 2) * currentTime * currentTime + 2) +
    startValue
  );
};
/* eslint-enable */

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

  if (action.type === SET_BROWSER_VIEW_READY) {
    if (action.payload.name === 'puppet' && action.payload.ready) {
      if (
        store
          .getState()
          .electron.views.puppet.url.startsWith(
            'https://www.immobilienscout24.de/Suche'
          )
      ) {
        const rawData = await store
          .getState()
          .electron.views.puppet.browserView.webContents.executeJavaScript(
            `IS24['resultList']['resultListModel']['searchResponseModel']['resultlist.resultlist']['resultlistEntries'][0]['resultlistEntry']`
          );
        store.dispatch(dataOverviewSet(rawData));
      }
    }
  }

  if (action.type === INTERNAL_ADD_BROWSER_VIEW) {
    const { window } = store.getState().electron;
    if (window === undefined || window === null) {
      console.error('Main window not defined!');
      return;
    }

    const { name, browserView, initialUrl } = action.payload;

    // window.addBrowserView(browserView);

    browserView.webContents.on('did-finish-load', () => {
      store.dispatch(setBrowserViewReady(name, true));
    });
    browserView.webContents.on('new-window', (event, targetUrl) => {
      event.preventDefault();
      shell.openExternal(targetUrl);
    });

    if (initialUrl) {
      process.nextTick(() => store.dispatch(electronRouting(name, initialUrl)));
    }
  }

  if (action.type === SET_BROWSER_WINDOW) {
    const { window } = action.payload;
    window.on('resize', () => resizeViews(store.getState().electron));
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

  next(action);
};
