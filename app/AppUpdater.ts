import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { logger } from './utils/tracer-logger.js';
import { LOADING, UP_TO_DATE } from './constants/updater';

const enableDebug = process.env.ENABLE_DEBUG === 'true';

// TODO refactor: one function, doing init and taking the two callbacks
export default class AppUpdater {
  static init() {
    logger.trace();
    if (enableDebug) {
      log.transports.file.level = 'info';
      autoUpdater.logger = log;
    }

    autoUpdater.checkForUpdatesAndNotify();
  }

  static onUpdateAvailable(callback: (version: string) => void) {
    logger.trace();
    autoUpdater.on('checking-for-update', () => {
      callback(LOADING);
    });
    autoUpdater.on('update-available', ({ version }) => {
      callback(version);
    });
    autoUpdater.on('update-not-available', () => {
      callback(UP_TO_DATE);
    });
  }

  static onDownloadProgress(callback: (percentage: number) => void) {
    logger.trace();
    autoUpdater.on('download-progress', ({ percent }) => {
      callback(percent);
    });
    autoUpdater.on('update-downloaded', () => {
      callback(100);
    });
  }
}
