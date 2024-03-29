import type { StageDescription } from './types';
import configurationExplanationStage from './configurationExplanation';
import areaSelectionStage from './areaSelection';
import welcomeStage from './welcome';
import flatDescriptionStage from './flatDescription';
import personalDataStage from './personalData';
import reviewStage from './review';
import applicationTextStage from './applicationText';
import artExplanationStage from './artExplanation';

const stages: Array<StageDescription> = [
  welcomeStage,
  artExplanationStage,
  configurationExplanationStage,
  areaSelectionStage,
  flatDescriptionStage,
  personalDataStage,
  applicationTextStage,
  reviewStage
];
export default stages;
