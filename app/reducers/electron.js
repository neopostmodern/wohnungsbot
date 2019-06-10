// @flow
import dotProp from 'dot-prop-immutable';
import type { BrowserWindow, BrowserView } from 'electron';
import {
  HIDE_CONFIGURATION,
  INTERNAL_ADD_BROWSER_VIEW,
  SET_BOT_IS_ACTING,
  SET_BROWSER_VIEW_READY,
  SET_BROWSER_VIEW_URL,
  SET_BROWSER_WINDOW
} from '../constants/actionTypes';
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

export type electronStateType = {
  window: ?BrowserWindow,
  views: Views,
  configurationHidden: boolean,
  isBotActing: boolean
};

const electronDefaultState: electronStateType = {
  views: {},
  window: null,
  configurationHidden: false,
  isBotActing: false
};

export default function electron(
  state: electronStateType = electronDefaultState,
  action: Action
): electronStateType {
  if (action.type === SET_BROWSER_WINDOW) {
    return Object.assign({}, state, { window: action.payload.window });
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
    return Object.assign({}, state, { configurationHidden: true });
  }
  if (action.type === SET_BOT_IS_ACTING) {
    return Object.assign({}, state, {
      isBotActing: action.payload.isActing,
      botMessage: action.payload.isActing ? action.payload.message : ''
    });
  }

  return state;
}
