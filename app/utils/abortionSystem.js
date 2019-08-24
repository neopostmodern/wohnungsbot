const AbortionSystem: {
  abortFunction: ?() => void,
  registerAbort: (abort: () => void) => void,
  cancelAbort: () => void,
  abort: () => void
} = {
  abortFunction: null,
  registerAbort(abort) {
    AbortionSystem.abortFunction = abort;
  },
  cancelAbort() {
    AbortionSystem.abortFunction = null;
  },
  abort() {
    if (!AbortionSystem.abortFunction) {
      // eslint-disable-next-line no-console
      console.error('Abort called without a function present');
      return;
    }
    AbortionSystem.abortFunction();
    AbortionSystem.abortFunction = null;
  }
};
export default AbortionSystem;
