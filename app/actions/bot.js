import type { Action } from '../reducers/types';
import {
  APPLY_TO_FLAT,
  DISCARD_FLAT,
  INVESTIGATE_FLAT,
  RETURN_TO_OVERVIEW
} from '../constants/actionTypes';

export function queueInvestigateFlat(flatId: string): Action {
  return {
    type: INVESTIGATE_FLAT,
    payload: { flatId },
    meta: {
      queue: true,
      message: 'Wohnung genauer anschauen'
    }
  };
}

export function returnToOverview(): Action {
  return {
    type: RETURN_TO_OVERVIEW,
    payload: null,
    meta: {
      queue: true,
      message: 'Fertig.',
      immediate: true
    }
  };
}

// todo: recycle as non-queued action
export function applyToFlat(flatId: string): Action {
  return {
    type: APPLY_TO_FLAT,
    payload: { flatId },

    meta: {
      queue: true,
      message: 'Bewerbung schreiben!',
      immediate: true
    }
  };
}

// todo: recycle as non-queued action
export function discardFlat(): Action {
  return {
    type: DISCARD_FLAT,
    payload: null,

    meta: {
      queue: true,
      message: 'Wohnung leider unpassend :(',
      immediate: true
    }
  };
}
