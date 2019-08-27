export const ABORTION_MANUAL = 'ABORTION_MANUAL';
export const ABORTION_ERROR = 'ABORTION_ERROR';
export type AbortionReason = ABORTION_MANUAL | ABORTION_ERROR;

const ABORTION_SUSPENSION_PERIOD = 10000;

const AbortionSystem: {
  abortFunction: ?() => void,
  nestedFunctionsMayContinue: boolean,
  abortionReason: ?AbortionReason,
  registerAbort: (abort: () => void) => void,
  cancelAbort: () => void,
  abort: (reason: AbortionReason) => void
} = {
  abortFunction: null,
  nestedFunctionsMayContinue: true,
  reason: null,
  registerAbort(abort) {
    AbortionSystem.abortFunction = abort;
    // reset reason
    AbortionSystem.abortionReason = null;
  },
  cancelAbort() {
    AbortionSystem.abortFunction = null;
  },
  abort(reason: AbortionReason) {
    // eslint-disable-next-line no-console
    console.log(
      `ABORT - called with reason ${reason} - some activities will be suspended for ${ABORTION_SUSPENSION_PERIOD}`
    );
    AbortionSystem.abortionReason = reason;

    // for 10 seconds tell all `while (true)` loops to stop
    // 10 seconds is less than the timeout in middleware/bot.js
    AbortionSystem.nestedFunctionsMayContinue = false;
    setTimeout(() => {
      AbortionSystem.nestedFunctionsMayContinue = true;
      // eslint-disable-next-line no-console
      console.log('ABORT - end of process, return to normal');
    }, ABORTION_SUSPENSION_PERIOD);

    if (AbortionSystem.abortFunction) {
      AbortionSystem.abortFunction();
    }
    AbortionSystem.abortFunction = null;
  }
};
export default AbortionSystem;
