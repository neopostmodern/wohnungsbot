export const sleep = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

export const timeout = (promise, waitingTime) =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(
      () => reject(new Error('Timed out')),
      waitingTime
    );
    try {
      const promiseReturnValue = await promise;
      clearTimeout(timeoutId);
      resolve(promiseReturnValue);
    } catch (error) {
      reject(error);
    }
  });
