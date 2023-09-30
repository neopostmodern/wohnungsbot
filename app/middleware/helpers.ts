import fs from "fs";
import path from "path";
import { app } from "electron";
import type { Action, Dispatch, Store } from "../reducers/types";
import { PRINT_TO_PDF, SEND_MAIL } from "../constants/actionTypes";
import sendMail from "../utils/email";
import { sleep, timeout } from "../utils/async";
import { electronRouting } from "../actions/electron";
import { electronObjects } from "../store/electronObjects";
import ElectronUtils from '../utils/electronUtils';
const pdfFolderPath = path.join(app.getPath('userData'), 'pdf');

if (!fs.existsSync(pdfFolderPath)) {
  fs.mkdirSync(pdfFolderPath);
} // eslint-disable-next-line no-unused-vars


export default ((store: Store) => (next: Dispatch) => async (action: Action) => {
  if (action.type === SEND_MAIL) {
    const {
      to,
      subject,
      text
    } = action.payload;
    await sendMail(to, subject, text);
  }

  if (action.type === PRINT_TO_PDF) {
    const { flatId } = action.payload;
    const filePath = path.join(pdfFolderPath, `${flatId}.pdf`);

    try {
      const fileStat = await fs.promises.stat(filePath);

      if (fileStat.isFile()) {
        // pdf has already been printed, return
        return filePath;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        // eslint-disable-next-line no-console
        console.error(error);
        throw error;
      }
    }

    try {
      store.dispatch(electronRouting('print', 'https://www.immobilienscout24.de/expose/' + flatId + '/print'));
      await sleep(3000);
      const {
        webContents
      } = electronObjects.views['print'];
      // `printToPDF` times out if there are iframes on the page: https://github.com/electron/electron/issues/20634
      await new ElectronUtils(webContents).evaluate(`document.querySelectorAll('iframe').forEach(iframe => iframe.remove())`);
      const pdfData = await timeout(webContents.printToPDF({
        pageSize: 'A4'
      }), 10000);
      await fs.promises.writeFile(filePath, pdfData);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create PDF:', error);
      return null;
    }

    // ignoring further returned values!
    next(action);
    return filePath;
  }

  return next(action);
});
