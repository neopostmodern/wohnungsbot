import dotProp from 'dot-prop-immutable';
import type { Action } from './types';
import {
  LAUNCH_NEXT_TASK,
  POP_FLAT_FROM_QUEUE,
  QUEUE_INVESTIGATE_FLAT,
  TASK_FINISHED
} from '../constants/actionTypes';
export type schedulerStateType = {
  queuedFlatIds: Array<string>;
  isActive: boolean;
};
const schedulerDefaultState: schedulerStateType = {
  queuedFlatIds: [],
  isActive: false
};
export default function scheduler(
  state: schedulerStateType = schedulerDefaultState,
  action: Action
): schedulerStateType {
  if (action.type === QUEUE_INVESTIGATE_FLAT) {
    const { flatId } = action.payload;

    if (!state.queuedFlatIds.includes(flatId)) {
      return dotProp.set(
        state,
        'queuedFlatIds',
        state.queuedFlatIds.concat([flatId])
      );
    }
  }

  if (action.type === POP_FLAT_FROM_QUEUE) {
    const { flatId } = action.payload;
    return dotProp.set(
      state,
      'queuedFlatIds',
      state.queuedFlatIds.filter((queuedFlatId) => queuedFlatId !== flatId)
    );
  }

  if (action.type === LAUNCH_NEXT_TASK) {
    return dotProp.set(state, 'isActive', true);
  }

  if (action.type === TASK_FINISHED) {
    return dotProp.set(state, 'isActive', false);
  }

  return state;
}
