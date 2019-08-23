export const sleep = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

export const timeout = (promise, waitingTime) => new Promise(async (resolve, reject) => {
  const timeoutId = setTimeout(() => reject("Promise timed out"), waitingTime);
  const promiseReturnValue = await promise;
  clearTimeout(timeoutId);
  resolve(promiseReturnValue);
});
