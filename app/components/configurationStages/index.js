import configurationExplanationStage from './configurationExplanation';
import areaSelectionStage from './areaSelection';
import welcomeStage from './welcome';
import flatDescriptionStage from './flatDescription';
import reviewStage from './review';
import type { StageDescription } from './types';

const stages: Array<StageDescription> = [
  welcomeStage,
  configurationExplanationStage,
  areaSelectionStage,
  flatDescriptionStage,
  reviewStage
];

export default stages;
