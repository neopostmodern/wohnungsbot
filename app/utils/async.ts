export const sleep = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

export const timeout = <T>(
  promise: Promise<T>,
  waitingTime: number
): Promise<T> =>
  /* eslint-disable no-async-promise-executor */
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
/* eslint-enable no-async-promise-executor */
