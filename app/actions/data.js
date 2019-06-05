import type { RawOverviewData } from '../reducers/data';
import type { Action } from '../reducers/types';
import {
  DATA_OVERVIEW_SET,
  REFRESH_VERDICTS,
  SET_VERDICT
} from '../constants/actionTypes';

export function dataOverviewSet(data: RawOverviewData): Action {
  return {
    type: DATA_OVERVIEW_SET,
    payload: { data }
  };
}

export function setVerdict(flatId, verdict): Action {
  return {
    type: SET_VERDICT,
    payload: { flatId, verdict }
  };
}

export function refreshVerdicts(): Action {
  return {
    type: REFRESH_VERDICTS,
    payload: null
  };
}
