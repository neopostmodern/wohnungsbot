// @flow

import { SEND_MAIL } from '../constants/actionTypes';
import { MAIN } from '../constants/targets';
import { generateInPlaceDescription } from '../flat/applicationTextBuilder';
import { flatPageUrl } from '../flat/urlBuilder';
import type { ContactData } from '../reducers/configuration';
import type { OverviewDataEntry } from '../reducers/data';
import type { Action, Dispatch, GetState } from '../reducers/types';
import { markCompleted } from './cache';
import { CACHE_NAMES } from '../reducers/cache';

// eslint-disable-next-line import/prefer-default-export
export const sendMail = (
  to: string,
  subject: string,
  text: string
): Action => ({
  type: SEND_MAIL,
  payload: { to, subject, text },
  meta: { target: MAIN }
});

const flatDescriptionSnippet = (flatOverview: OverviewDataEntry) =>
  `${flatOverview.title}
${flatOverview.address.description}
${flatOverview.area}m²
${flatOverview.rent}€ Kalt`;

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
        )} mit einem öffentlichen Besichtigungstermin gefunden:
${flatDescriptionSnippet(flatOverview)}

Er hat natürlich keine Bewerbung abgeschickt. Hier kannst du dir die Wohnung anschauen: ${flatPageUrl(
          flatOverview.id
        )}

Viel Erfolg mit der Wohnung wünscht der Wohnungsbot!`
      )
    );

    dispatch(
      markCompleted(CACHE_NAMES.MAIL, flatOverview.id, {
        flatId: flatOverview.id
      })
    );
  };
};

export const sendApplicationNotificationEmail = (
  contactData: ContactData,
  flatOverview: OverviewDataEntry,
  applicationText: string
): Action =>
  sendMail(
    contactData.eMail,
    '[Wohnungsbot] Der Bot hat sich für dich auf eine Wohnung beworben!',
    `Hallo ${contactData.firstName},

der Bot hat gerade eine Wohnung ${generateInPlaceDescription(
      flatOverview.address
    )} für dich angeschrieben!

Am besten tust du jetzt nichts. Warte erstmal ob du angeschrieben wirst für eine Besichtigung.

Dann kannst du dir hier die Wohnung anschauen: ${flatPageUrl(flatOverview.id)}
${flatDescriptionSnippet(flatOverview)}

Du (also der Bot) hast geschrieben:

${applicationText}

Viel Erfolg mit der Wohnung wünscht der Wohnungsbot!`
  );
