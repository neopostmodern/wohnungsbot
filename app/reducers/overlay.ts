import dotProp from "dot-prop-immutable";
import type { Action } from "./types";
import { CLICK_ANIMATION_CLEAR, CLICK_ANIMATION_SHOW, REMOVE_BOUNDING_BOXES_IN_GROUP, SET_BOUNDING_BOX, SET_BOUNDING_BOX_GROUP } from "../constants/actionTypes";
export type baseAnimation = {
  animationId: string;
};
export type clickAnimation = {
  type: "click";
  x: number;
  y: number;
} & baseAnimation;
export type anyAnimation = clickAnimation;
// eslint-disable-next-line flowtype/no-weak-types
export type AttachedInformation = Record<string, any>;
export type ElementBoundingBox = {
  selector: string;
  group?: string;
  attachedInformation: AttachedInformation;
  boundingBox: ClientRect;
};
export type overlayStateType = {
  animations: Array<anyAnimation>;
  boundingBoxes: Array<ElementBoundingBox>;
};
const overlayDefaultState: overlayStateType = {
  animations: [],
  boundingBoxes: []
};
export default function overlay(state: overlayStateType = overlayDefaultState, action: Action): overlayStateType {
  switch (action.type) {
    case CLICK_ANIMATION_SHOW:
      return dotProp.merge(state, 'animations', [action.payload]);

    case CLICK_ANIMATION_CLEAR:
      return dotProp.set(state, 'animations', state.animations.filter(animation => animation.animationId !== action.payload.animationId));

    case SET_BOUNDING_BOX:
      return dotProp.set(state, 'boundingBoxes', state.boundingBoxes.filter(({
        selector
      }) => selector !== action.payload.selector).concat([action.payload]));

    case SET_BOUNDING_BOX_GROUP:
      return dotProp.set(state, 'boundingBoxes', state.boundingBoxes.filter(({
        group
      }) => group !== action.payload.group).concat(action.payload.boundingBoxes));

    case REMOVE_BOUNDING_BOXES_IN_GROUP:
      return dotProp.set(state, 'boundingBoxes', state.boundingBoxes.filter(({
        group
      }) => group !== action.payload.group));

    default:
      return state;
  }
}