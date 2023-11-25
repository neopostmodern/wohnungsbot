import type { BrowserView, BrowserWindow } from 'electron';
import { BrowserViewName } from '../reducers/electron';

interface ElectronObjects {
  views: {
    [viewName in BrowserViewName]: BrowserView;
  };
  window: BrowserWindow;
}

const electronObjects: ElectronObjects = {
  views: {} as any,
  window: null
};
export default electronObjects;
