// @flow

import { SEND_MAIL } from '../constants/actionTypes';
import { MAIN } from '../constants/targets';
import { generateInPlaceDescription } from '../flat/applicationTextBuilder';
import { flatPageUrl } from '../flat/urlBuilder';
import type { ContactData } from '../reducers/configuration';
import type { OverviewDataEntry } from '../reducers/data';
import type { Dispatch, GetState } from '../reducers/types';

// eslint-disable-next-line import/prefer-default-export
export const sendMail = (to: string, subject: string, text: string) => ({
  type: SEND_MAIL,
  payload: { to, subject, text },
  meta: { target: MAIN }
});

export const sendFlatViewingNotificationMail = (
  contactData: ContactData,
  flatOverview: OverviewDataEntry
) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      configuration: {
        policies: { flatViewingNotificationMails }
      },
      cache
    } = getState();

    if (!flatViewingNotificationMails || cache.mail[flatOverview.id]) {
      return;
    }

    dispatch(
      sendMail(
        contactData.eMail,
        '[Wohnungsbot] Öffentlicher Wohnungsbesichtigungstermin',
        `Hallo ${contactData.firstName},

der Bot hat gerade eine Wohnung ${generateInPlaceDescription(
          flatOverview.address
        )} mit einem öffentlichen Besichtigungstermin gefunden.
Er hat natürlich keine Bewerbung abgeschickt, aber du kannst hier den Termin heraussuchen: ${flatPageUrl(
          flatOverview.id
        )}

Viel Erfolg mit der Wohnung wünscht der Wohnungsbot!`
      )
    );
  };
};
