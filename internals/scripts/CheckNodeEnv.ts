export default function CheckNodeEnv(expectedEnv) {
  if (!expectedEnv) {
    throw new Error('"expectedEnv" not set');
  }

  if (process.env.NODE_ENV !== expectedEnv) {
    // eslint-disable-next-line no-console
    console.log(
      `"process.env.NODE_ENV" must be "${expectedEnv}" to use this webpack config`
    );
    process.exit(2);
  }
}
