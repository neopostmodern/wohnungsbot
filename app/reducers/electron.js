// @flow
import dotProp from 'dot-prop-immutable';
import type { BrowserWindow, BrowserView } from 'electron';
import {
  HIDE_CONFIGURATION,
  INTERNAL_ADD_BROWSER_VIEW,
  SET_AVAILABLE_VERSION,
  SET_BROWSER_VIEW_READY,
  SET_BROWSER_VIEW_URL,
  SET_BROWSER_WINDOW,
  SET_INTERACTIVE_MODE,
  SET_UPDATE_DOWNLOAD_PROGRESS
} from '../constants/actionTypes';
import { LOADING } from '../constants/updater';
import type { Action } from './types';

export type BrowserViewName =
  | 'puppet'
  | 'sidebar'
  | 'botOverlay'
  | 'configuration'
  | 'devMenu';
export type BrowserViewState = {
  browserView: BrowserView,
  url: string,
  ready: boolean
};
export type Views = {
  [key: BrowserViewName]: BrowserViewState
};

export type UpdaterStatus = {
  availableVersion: string,
  downloadProgressPercentage: number
};

export type electronStateType = {
  window: ?BrowserWindow,
  views: Views,
  configurationHidden: boolean,
  interactiveMode: boolean,
  updater: UpdaterStatus
};

const electronDefaultState: electronStateType = {
  views: {},
  window: null,
  configurationHidden: false,
  interactiveMode: false,
  updater: {
    availableVersion: LOADING,
    downloadProgressPercentage: 0
  }
};

export default function electron(
  state: electronStateType = electronDefaultState,
  action: Action
): electronStateType {
  if (action.type === SET_BROWSER_WINDOW) {
    return { ...state, window: action.payload.window };
  }
  if (action.type === INTERNAL_ADD_BROWSER_VIEW) {
    const { name, browserView } = action.payload;
    return dotProp.set(state, `views.${name}`, { browserView, ready: false });
  }
  if (action.type === SET_BROWSER_VIEW_READY) {
    const { name, ready } = action.payload;
    return dotProp.set(state, `views.${name}.ready`, ready);
  }
  if (action.type === SET_BROWSER_VIEW_URL) {
    const { name, url } = action.payload;
    return dotProp.set(state, `views.${name}.url`, url);
  }
  if (action.type === HIDE_CONFIGURATION) {
    return { ...state, configurationHidden: true };
  }
  if (action.type === SET_INTERACTIVE_MODE) {
    return { ...state, interactiveMode: action.payload };
  }
  if (action.type === SET_AVAILABLE_VERSION) {
    return {
      ...state,
      updater: { ...state.updater, availableVersion: action.payload.version }
    };
  }
  if (action.type === SET_UPDATE_DOWNLOAD_PROGRESS) {
    return {
      ...state,
      updater: {
        ...state.updater,
        downloadProgressPercentage: action.payload.percentage
      }
    };
  }

  return state;
}
