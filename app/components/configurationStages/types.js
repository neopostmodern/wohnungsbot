import type { Node } from 'react';
import type {
  configurationBoolean,
  configurationNumbers,
  configurationStateType
} from '../../reducers/configuration';

export type InheritedProps = {
  togglePostcode: (postcode: string) => void,
  resetPostcodes: () => void,
  toggleFloor: (floor: number) => void,
  toggleBoolean: (name: configurationBoolean) => void,
  setNumber: (name: configurationNumbers, value: ?number) => void,
  configuration: configurationStateType
};
export type FlexibleNode = string | Node | ((props: InheritedProps) => Node);
type ElementDescription = {
  text: FlexibleNode,
  className?: string,
  style?: { [key: string]: string | number }
};
type ButtonDescription = ElementDescription;
export type StageDescription = {
  container?: {
    className?: string
  },
  title?: FlexibleNode,
  subtitle?: FlexibleNode,
  body: FlexibleNode,
  buttons: {
    forward: ButtonDescription & {
      checkInvalid?: configurationStateType => false | FlexibleNode
    },
    backwards?: ButtonDescription
  }
};
