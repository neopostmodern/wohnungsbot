import os from 'node:os';
import { version as v } from '../../package.json';

export const version = v;

export const osData = {
  platform: os.platform(),
  release: os.release(),
  machine: os.machine(),
  architecture: os.arch(),
  version: os.version(),
  memory: os.totalmem(),
  freeMemory: os.freemem(),
  cpus: os.cpus().length
};
