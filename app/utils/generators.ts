// this is largely copied form here: https://dev.to/chromiumdev/cancellable-async-functions-in-javascript-5gp7
// eslint-disable-next-line import/prefer-default-export
export const abortable = (generator) => {
  let shouldAbort = false;
  return {
    abortableAction: async (...args) => {
      const iter = generator(...args);
      let resumeValue;

      /* eslint-disable no-await-in-loop */
      for (;;) {
        const n = iter.next(resumeValue);

        if (n.done) {
          return n.value; // final return value of passed generator
        }

        // whatever the generator yielded, _now_ run await on it
        resumeValue = await n.value;

        if (shouldAbort) {
          // eslint-disable-next-line consistent-return
          return;
        } // next loop, we give resumeValue back to the generator
      }
      /* eslint-enable no-await-in-loop */
    },
    abort: () => {
      shouldAbort = true;
    }
  };
};
