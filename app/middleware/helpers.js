// @flow

import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import type { Action, Dispatch, Store } from '../reducers/types';
import { PRINT_TO_PDF, SEND_MAIL } from '../constants/actionTypes';
import sendMail from '../utils/email';

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => async (action: Action) => {
  if (action.type === SEND_MAIL) {
    const { to, subject, text } = action.payload;
    await sendMail(to, subject, text);
  }

  if (action.type === PRINT_TO_PDF) {
    const { name, fileIdentifier } = action.payload;
    const { webContents } = store.getState().electron.views[name].browserView;

    const filePath = path.join(
      app.getPath('userData'),
      `${fileIdentifier}.pdf`
    );
    webContents.printToPDF({ pageSize: 'A4' }, (pdfError, pdfData) => {
      if (pdfError) {
        console.error(pdfError);
        return;
      }

      fs.writeFile(filePath, pdfData, fileError => {
        if (fileError) {
          console.error(fileError);

        }

        // todo: resolve(filePath);
      });
    });
  }

  return next(action);
};
