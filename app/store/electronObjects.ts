import type { BrowserWindow, WebContentsView } from 'electron';
import { BrowserViewName } from '../reducers/electron';

interface ElectronObjects {
  views: {
    [viewName in BrowserViewName]: WebContentsView;
  };
  window: BrowserWindow;
}

const electronObjects: ElectronObjects = {
  views: {} as any,
  window: null
};
export default electronObjects;
