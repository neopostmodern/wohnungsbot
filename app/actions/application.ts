import type { ApplicationData } from '../reducers/cache';
import { CacheNames } from '../reducers/cache';
import type { Dispatch, GetState, ThunkAction } from '../reducers/types';
import { markCompleted } from './cache';
import { sleep, timeout } from '../utils/async';
import type { Configuration } from '../reducers/configuration';
import type { dataStateType, OverviewDataEntry } from '../reducers/data';
import electronObjects from '../store/electronObjects';
import ElectronUtilsRedux from '../utils/electronUtilsRedux';
import {
  popFlatFromQueue,
  returnToSearchPage,
  setBotIsActing,
  setBotMessage,
  setShowOverlay,
  taskFinished
} from './bot';
import performApplication from '../utils/performApplication';
import { abortable } from '../utils/generators';
import { printToPDF } from './helpers';
import AbortionSystem, {
  ABORTION_ERROR,
  ABORTION_MANUAL
} from '../utils/abortionSystem';

const markApplicationCompleted = async (
  dispatch: Dispatch,
  applicationData: ApplicationData
) => {
  dispatch(popFlatFromQueue(applicationData.flatId));
  return dispatch(
    markCompleted(
      CacheNames.APPLICATIONS,
      applicationData.flatId,
      applicationData
    )
  );
};

export const endApplicationProcess =
  (): ThunkAction => async (dispatch: Dispatch) => {
    dispatch(returnToSearchPage());
    dispatch(setBotMessage(null));
    dispatch(taskFinished());
    await sleep(5000);
    // this kicks of next queued action, if any (?? — shouldn't this be caused by the page load caused in by `returnToSearchPage`)
    dispatch(setBotIsActing(false));
    dispatch(setShowOverlay(true));
  };

export const generateApplicationTextAndSubmit =
  (flatId: string): ThunkAction =>
  async (dispatch: Dispatch, getState: GetState) => {
    const {
      configuration,
      data
    }: {
      configuration: Configuration;
      data: dataStateType;
    } = getState();
    const { webContents } = electronObjects.views.puppet;
    const electronUtils = new ElectronUtilsRedux(webContents, dispatch);
    const pdfPath: string = await dispatch(printToPDF(flatId));
    const { abortableAction: abortablePerformApplication, abort } =
      abortable(performApplication);
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
      // eslint-disable-next-line no-console
      console.error(`Error in application:
${error}`);
      success = false;
      AbortionSystem.abort(ABORTION_ERROR);
      reason = error.message;
    }

    if (AbortionSystem.abortionReason !== ABORTION_MANUAL) {
      await markApplicationCompleted(dispatch, {
        flatId,
        success,
        addressDescription: data.overview[flatId].address.description,
        reason,
        pdfPath
      });
    }

    await dispatch(endApplicationProcess());
  };

export const discardApplicationProcess =
  (flatOverview: OverviewDataEntry): ThunkAction =>
  async (dispatch: Dispatch) => {
    dispatch(setBotMessage(`Wohnung ist leider unpassend :(`));
    await sleep(5000);
    dispatch(popFlatFromQueue(flatOverview.id));
    await markApplicationCompleted(dispatch, {
      flatId: flatOverview.id,
      success: false,
      addressDescription: flatOverview.address.description,
      reason: 'UNSUITABLE' // this won't show up in the sidebar
    });
    await dispatch(endApplicationProcess());
  };
