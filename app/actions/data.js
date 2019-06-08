import type { RawOverviewData } from '../reducers/data';
import type { Action } from '../reducers/types';
import {
  SET_OVERVIEW_DATA,
  REFRESH_VERDICTS,
  SET_VERDICT,
  SET_FLAT_DATA
} from '../constants/actionTypes';

export function setRawOverviewData(data: RawOverviewData): Action {
  return {
    type: SET_OVERVIEW_DATA,
    payload: { data }
  };
}

export function setRawFlatData(flatData: RawOverviewData): Action {
  return {
    type: SET_FLAT_DATA,
    payload: { flatData }
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
