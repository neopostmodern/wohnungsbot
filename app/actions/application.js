// @flow

import type { ApplicationData, cacheStateType } from '../reducers/cache';
import { CACHE_NAMES } from '../reducers/cache';
import type { Dispatch, GetState } from '../reducers/types';
import { markCompleted } from './cache';
import { sleep, timeout } from '../utils/async';
import type { Configuration } from '../reducers/configuration';
import type { dataStateType, OverviewDataEntry } from '../reducers/data';
import type { electronStateType } from '../reducers/electron';
import ElectronUtilsRedux from '../utils/electronUtilsRedux';
import {
  returnToSearchPage,
  setBotIsActing,
  setBotMessage,
  setShowOverlay,
  taskFinished
} from './bot';
import performApplication from '../utils/performApplication';
import { abortable } from '../utils/generators';
import { printToPDF } from './helpers';
import AbortionSystem from '../utils/abortionSystem';

export const generateApplicationTextAndSubmit = (flatId: string) => async (
  dispatch: Dispatch,
  getState: GetState
) => {
  const {
    configuration,
    data,
    electron
  }: {
    configuration: Configuration,
    data: dataStateType,
    electron: electronStateType,
    cache: cacheStateType
  } = getState();

  const { webContents } = electron.views.puppet.browserView;
  const electronUtils = new ElectronUtilsRedux(webContents, dispatch);

  const pdfPath = await dispatch(printToPDF('puppet', flatId));

  const { abortableAction: abortablePerformApplication, abort } = abortable(
    performApplication
  );
  AbortionSystem.registerAbort(abort);
  let success;
  let reason;
  try {
    await timeout(
      abortablePerformApplication(
        dispatch,
        electronUtils,
        configuration,
        data.overview[flatId]
      ),
      300000
    );
    success = true;
  } catch (error) {
    success = false;
    AbortionSystem.abort();
    reason = error.message;
  }
  await dispatch(
    markApplicationComplete({
      flatId,
      success,
      addressDescription: data.overview[flatId].address.description,
      reason,
      pdfPath
    })
  );
};

export const markApplicationComplete = (data: ApplicationData) => async (
  dispatch: Dispatch
) => {
  const { flatId } = data;
  dispatch(markCompleted(CACHE_NAMES.APPLICATIONS, flatId, data));
  dispatch(returnToSearchPage());
  dispatch(setBotMessage(null));
  dispatch(taskFinished());
  await sleep(5000);

  // this kicks of next queued action, if any
  dispatch(setBotIsActing(false));
  dispatch(setShowOverlay(true));
};

export const discardApplicationProcess = (
  flatOverview: OverviewDataEntry
) => async (dispatch: Dispatch) => {
  dispatch(setBotMessage(`Wohnung ist leider unpassend :(`));
  await sleep(5000);
  dispatch(
    markApplicationComplete({
      flatId: flatOverview.id,
      success: false,
      addressDescription: flatOverview.address.description,
      reason: 'UNSUITABLE' // this won't show up in the sidebar
    })
  );
};
