import dotProp from 'dot-prop-immutable';
import type { Action } from './types';
import {
  SET_BOT_IS_ACTING,
  SET_BOT_MESSAGE,
  SET_SHOW_OVERLAY
} from '../constants/actionTypes';
export type botStateType = {
  isActive: boolean;
  message: string | null | undefined;
  showOverlay: boolean;
};
const botDefaultState: botStateType = {
  isActive: false,
  message: null,
  showOverlay: true
};
export default function bot(
  state: botStateType = botDefaultState,
  action: Action
): botStateType {
  switch (action.type) {
    case SET_BOT_IS_ACTING:
      return dotProp.set(state, 'isActive', action.payload.isActing);

    case SET_BOT_MESSAGE:
      return dotProp.set(state, 'message', action.payload.message);

    case SET_SHOW_OVERLAY:
      return dotProp.set(state, 'showOverlay', action.payload.showOverlay);

    default:
      return state;
  }
}
