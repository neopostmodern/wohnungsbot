import type { Node } from 'react';
import type {
  configurationBoolean,
  configurationNumbers,
  Configuration
} from '../../reducers/configuration';
export type InheritedProps = {
  togglePostcode: (postcode: string) => void;
  resetPostcodes: () => void;
  toggleFloor: (floor: number) => void;
  toggleBoolean: (name: configurationBoolean) => void;
  setNumber: (
    name: configurationNumbers,
    value: number | null | undefined
  ) => void;
  setString: (name: string, value: string | null | undefined) => void;
  configuration: Configuration;
};
export type FlexibleNode = string | Node | ((props: InheritedProps) => Node);
type ElementDescription = {
  text: FlexibleNode;
  className?: string;
  style?: Record<string, string | number>;
};
type ButtonDescription = ElementDescription;
export type StageDescription = {
  rootContainer?: {
    className?: string;
  };
  container?: {
    className?: string;
  };
  title?: FlexibleNode;
  subtitle?: FlexibleNode;
  body: FlexibleNode;
  buttons: {
    forward: ButtonDescription & {
      checkInvalid?: (arg0: Configuration) => false | FlexibleNode;
    };
    backwards?: ButtonDescription;
  };
};
