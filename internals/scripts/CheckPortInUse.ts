/// <reference types="node" />
import detectPort from 'detect-port';

(function CheckPortInUse() {
  const port: number = parseInt(process.env.PORT || '1212', 10);

  detectPort(port, (err: Error, availablePort: number) => {
    if (port !== availablePort) {
      throw new Error(
        `Port "${port}" on "localhost" is already in use. Please use another port. ex: PORT=4343 yarn dev`
      );
    } else {
      // TS doesn't recognize we're in a node context here
      // @ts-ignore
      process.exit(0);
    }
  });
})();
