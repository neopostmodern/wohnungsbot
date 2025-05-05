import { logger } from './tracer-logger.js';

export const ABORTION_MANUAL = 'ABORTION_MANUAL';
export const ABORTION_ERROR = 'ABORTION_ERROR';
export type AbortionReason = typeof ABORTION_MANUAL | typeof ABORTION_ERROR;
const ABORTION_SUSPENSION_PERIOD = 10_000;

const AbortionSystem: {
  abortFunction: (() => void) | null | undefined;
  nestedFunctionsMayContinue: boolean;
  abortionReason: AbortionReason | null | undefined;
  registerAbort: (abort: () => void) => void;
  cancelAbort: () => void;
  abort: (reason: AbortionReason) => void;
} = {
  abortFunction: null,
  nestedFunctionsMayContinue: true,
  abortionReason: null,

  registerAbort(abort) {
    logger.trace();
    AbortionSystem.abortFunction = abort;
    // reset reason
    AbortionSystem.abortionReason = null;
  },

  cancelAbort() {
    logger.trace();
    AbortionSystem.abortFunction = null;
  },

  abort(reason: AbortionReason) {
    logger.info(
      `ABORT - called with reason ${reason} - some activities will be suspended for ${ABORTION_SUSPENSION_PERIOD / 1000}s`
    );
    AbortionSystem.abortionReason = reason;
    // for 10 seconds tell all `while (true)` loops to stop
    // 10 seconds is less than the timeout in middleware/bot.js
    AbortionSystem.nestedFunctionsMayContinue = false;
    setTimeout(() => {
      AbortionSystem.nestedFunctionsMayContinue = true;
      logger.info('ABORT - end of process, return to normal');
    }, ABORTION_SUSPENSION_PERIOD);

    if (AbortionSystem.abortFunction) {
      AbortionSystem.abortFunction();
    }

    AbortionSystem.abortFunction = null;
  }
};
export default AbortionSystem;
