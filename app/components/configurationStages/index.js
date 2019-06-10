import configurationExplanationStage from './configurationExplanation';
import areaSelectionStage from './areaSelection';
import welcomeStage from './welcome';
import flatDescriptionStage from './flatDescription';
import personalDataStage from './personalData';
import reviewStage from './review';
import type { StageDescription } from './types';
import applicationTextStage from './applicationText';

const stages: Array<StageDescription> = [
  welcomeStage,
  configurationExplanationStage,
  areaSelectionStage,
  flatDescriptionStage,
  personalDataStage,
  applicationTextStage,
  reviewStage
];

export default stages;
