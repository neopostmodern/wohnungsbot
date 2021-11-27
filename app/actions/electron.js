// @flow

import { MAIN } from '../constants/targets';
import type { Action } from '../reducers/types';
import type { BrowserViewName } from '../reducers/electron';
import {
  ELECTRON_ROUTING,
  HIDE_CONFIGURATION,
  INTERNAL_ADD_BROWSER_VIEW,
  PERFORM_SCROLL,
  SET_BROWSER_VIEW_READY,
  SET_BROWSER_VIEW_URL,
  SET_BROWSER_WINDOW,
  SET_INTERACTIVE_MODE,
  SHOW_CONFIGURATION,
  SHOW_DEV_TOOLS,
  OPEN_PDF,
  SET_AVAILABLE_VERSION,
  SET_UPDATE_DOWNLOAD_PROGRESS
} from '../constants/actionTypes';

export function setWindow(): Action {
  return {
    type: SET_BROWSER_WINDOW,
    payload: {},
    meta: {
      scope: 'local'
    }
  };
}

export function addView(name: BrowserViewName, initialUrl?: string): Action {
  return {
    type: INTERNAL_ADD_BROWSER_VIEW,
    payload: {
      name,
      initialUrl
    },
    meta: {
      scope: 'local',
      target: 'main'
    }
  };
}

export function setBrowserViewReady(
  name: BrowserViewName,
  ready: boolean
): Action {
  return {
    type: SET_BROWSER_VIEW_READY,
    payload: { name, ready }
  };
}

// this function is _not_ intended for routing, it retro-actively adjusts the
// URL in the store to reflect the BrowserView's URL
export function setBrowserViewUrl(name: BrowserViewName, url: string): Action {
  return {
    type: SET_BROWSER_VIEW_URL,
    payload: { name, url }
  };
}

export function electronRouting(
  name: BrowserViewName,
  targetUrl: string
): Action {
  return {
    type: ELECTRON_ROUTING,
    payload: { name, targetUrl },
    meta: {
      target: 'main'
    }
  };
}

export function hideConfiguration(): Action {
  return {
    type: HIDE_CONFIGURATION,
    payload: null
  };
}

export function showConfiguration(): Action {
  return {
    type: SHOW_CONFIGURATION,
    payload: null
  };
}

export function setInteractiveMode(interactiveModeEnabled: boolean): Action {
  return {
    type: SET_INTERACTIVE_MODE,
    payload: interactiveModeEnabled
  };
}

export function performScroll(name: BrowserViewName, deltaY: number): Action {
  return {
    type: PERFORM_SCROLL,
    payload: {
      name,
      deltaY
    },
    meta: {
      target: MAIN
    }
  };
}

export function showDevTools(name: BrowserViewName): Action {
  return {
    type: SHOW_DEV_TOOLS,
    payload: {
      name
    },
    meta: {
      target: MAIN
    }
  };
}

export function openPDF(pdfPath: string): Action {
  return {
    type: OPEN_PDF,
    payload: {
      pdfPath
    }
  };
}

export function setAvailableVersion(version: string): Action {
  return {
    type: SET_AVAILABLE_VERSION,
    payload: {
      version
    }
  };
}

export function setUpdateDownloadProgress(percentage: number): Action {
  return {
    type: SET_UPDATE_DOWNLOAD_PROGRESS,
    payload: {
      percentage
    }
  };
}
