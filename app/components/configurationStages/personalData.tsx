import React from 'react';
import styles from '../Configuration.scss';
import {
  EMPLOYMENT_STATUS,
  SALUTATIONS,
  USEACCOUNT
} from '../../reducers/configuration';
import type { Configuration } from '../../reducers/configuration';
import type { InheritedProps, StageDescription } from './types';
import Disclaimer from './disclaimer';
import TextField from '../inputs/TextInput';
import NumberField from '../inputs/NumberField';
import EnumField from '../inputs/EnumField';
import YesNo from '../inputs/YesNo';

const twoTextFieldsInLineStyles = {
  width: '200px'
};
const personalDataStage: StageDescription = {
  container: {
    className: styles.high
  },
  title: 'Wer bist du?',
  subtitle: (
    <>
      In der Bewerbung wirst du viele persönliche Daten angeben müssen. Du musst
      leider <em>alle</em> Felder ausfüllen, da der Bot sonst auf manche
      Inserate nicht reagieren kann.
    </>
  ),
  body: ({
    configuration: {
      immobilienScout24: { useAccount, userName, password },
      contactData: {
        salutation,
        firstName,
        lastName,
        street,
        houseNumber,
        postcode,
        city,
        eMail,
        telephone
      },
      additionalInformation: { employmentStatus, income },
      policies: {
        flatViewingNotificationMails,
        researchDataSharing,
        applicationNotificationMails,
        fillAsLittleAsPossible
      }
    },
    toggleBoolean,
    setNumber,
    setString
  }: InheritedProps) => (
    <div className={styles.marginBottom}>
      <div className={styles.row}>
        <div className={styles.column}>
          <h3>Deine aktuellen Kontaktdaten</h3>
          <EnumField
            value={salutation}
            onChange={(value) => setString('contactData.salutation', value)}
            options={SALUTATIONS}
            inline
            isWeird
          />
          <div
            className={styles.searchParameter}
            style={{
              marginTop: '0.5em'
            }}
          >
            <TextField
              value={firstName}
              onChange={(value) => setString('contactData.firstName', value)}
              placeholder="Vorname"
              style={twoTextFieldsInLineStyles}
            />{' '}
            <TextField
              value={lastName}
              onChange={(value) => setString('contactData.lastName', value)}
              placeholder="Nachname"
              style={twoTextFieldsInLineStyles}
            />
          </div>
          <div className={styles.searchParameter}>
            <TextField
              value={street}
              onChange={(value) => setString('contactData.street', value)}
              placeholder="Straße"
              style={{
                width: '320px'
              }}
            />{' '}
            <TextField
              value={houseNumber}
              onChange={(value) => setString('contactData.houseNumber', value)}
              placeholder="Nr."
              style={{
                width: '80px'
              }}
            />
          </div>
          <div className={styles.searchParameter}>
            <TextField
              value={postcode}
              onChange={(value) => setString('contactData.postcode', value)}
              placeholder="PLZ"
              style={{
                width: '120px'
              }}
            />{' '}
            <TextField
              value={city}
              onChange={(value) => setString('contactData.city', value)}
              placeholder="Stadt"
              style={{
                width: '280px'
              }}
            />
          </div>
          <div className={styles.searchParameter}>
            <TextField
              value={telephone}
              onChange={(value) => setString('contactData.telephone', value)}
              placeholder="Telefonnummer"
              style={twoTextFieldsInLineStyles}
            />{' '}
            <TextField
              value={eMail}
              onChange={(value) => setString('contactData.eMail', value)}
              placeholder="E-Mail"
              style={twoTextFieldsInLineStyles}
            />
          </div>

          <h3>
            Möchtest du dich mit deinem ImmobilienScout24-Account anmelden?
          </h3>
          <div className={styles.searchParameter}>
            <EnumField
              options={USEACCOUNT}
              value={useAccount}
              onChange={(value) =>
                setString('immobilienScout24.useAccount', value)
              }
            />
            {useAccount === USEACCOUNT.JA && (
              <>
                <TextField
                  type="email"
                  value={userName}
                  required
                  onChange={(value) =>
                    setString('immobilienScout24.userName', value)
                  }
                  placeholder="E-Mail Addresse"
                  style={{
                    width: '190px'
                  }}
                />{' '}
                <TextField
                  type="password"
                  value={password}
                  required
                  onChange={(value) =>
                    setString('immobilienScout24.password', value)
                  }
                  placeholder="Passwort"
                  style={{
                    width: '190px'
                  }}
                />
              </>
            )}
            <div className={styles.comment}>
              Falls du einen ImmobilienScout24-Account hast, kannst du diesen
              hier angeben und der Bot meldet sich für dich an.
              <br />
              Sollte dies nicht funktionieren, oder hast du dich per Apple,
              Facebook oder Google angemeldet, nutze die manuelle Anmeldung.
              <br />
              Derzeit funktioniert der Bot ausschließlich für ImmobilienScout24.
            </div>
          </div>
          <h3>
            Möchtest du über erfolgte Bewerbungen per E-Mail informiert werden?
          </h3>
          <YesNo
            value={applicationNotificationMails}
            onChange={() =>
              toggleBoolean('policies.applicationNotificationMails')
            }
          />
          <div className={styles.comment}>
            Du kannst diese Einstellung hier jederzeit wieder ändern.
            <br />
            Die Plattform schickt dir unabhängig davon auch noch eine E-Mail,
            allerdings eventuell mit anderen / weniger Informationen.
          </div>
          <h3>
            Soll der Bot dich per E-Mail über öffentliche Termine für
            Massenbesichtigungen informieren?
          </h3>
          <YesNo
            value={flatViewingNotificationMails}
            onChange={() =>
              toggleBoolean('policies.flatViewingNotificationMails')
            }
          />
          <div className={styles.comment}>
            Manchmal ist der Besichtigungstermin bereits aus dem Inserat der
            Wohnung ersichtlich. Eine Bewerbung zu schicken ist dann natürlich
            sinnlos, aber der Bot kann dich stattdessen per E-Mail über den
            Termin benachrichtigen.
          </div>
        </div>
        <div className={styles.column}>
          <h3>Deine finanzielle Situation</h3>
          <NumberField
            value={income}
            onChange={(value) =>
              setNumber('additionalInformation.income', value)
            }
            style={{
              maxWidth: '100px'
            }}
          />
          € Einkommen
          <div className={styles.comment}>
            Monatliches Netto-Haushaltseinkommen — also: Einkommen (
            <em>abzüglich</em> Steuern etc.) aller einziehenden Menschen
            zusammen
          </div>
          <br />
          Du bist...
          <EnumField
            options={EMPLOYMENT_STATUS}
            value={employmentStatus}
            onChange={(value) =>
              setString('additionalInformation.employmentStatus', value)
            }
            isWeird
          />
          <h3>Möglichst wenig Daten angeben?</h3>
          <YesNo
            value={fillAsLittleAsPossible}
            onChange={() => toggleBoolean('policies.fillAsLittleAsPossible')}
          />
          <div className={styles.comment}>
            Nicht alle Felder sind im Formular der Wohnungsplattform
            verpflichtend. Der Bot kann die freiwilligen Felder leer lassen um
            deine Daten zu schützen. Datenschutz ist zwar gut, aber viele
            Vermieter_innen wollen dich anhand dieser Daten bewerten. Daher gilt
            leider teilweise: weniger Datenschutz = größere Chancen.
          </div>
          <div className={styles.pending}>
            <h3>
              Dürfen anonyme Daten zu deiner Wohnungsnot gesammelt werden?
            </h3>
            <YesNo
              value={researchDataSharing}
              onChange={() => toggleBoolean('policies.researchDataSharing')}
            />
            <div className={styles.comment}>
              <p>
                Um nicht nur im künstlerischen sondern auch im
                wissenschaftlichen Rahmen eine Aussage zur Wohnungsnot machen zu
                können, möchte der Bot folgende Informationen sammeln: (1) Wie
                viele Wohnungen in deinem Suchverlauf deinen Vorstellungen
                entsprechen, aber zu teuer sind; (2) Wie viel Prozent des
                Haushaltseinkommens du für deine Wohnung bereit bist zu zahlen.
              </p>
              <p>
                Es werden keinerlei persönliche Daten übertragen. Alles was der
                Bot an den Server sendet ist der Preis der Wohnung, dein
                Preislimit (im Falle von 1) und das Haushaltseinkommen (im Falle
                von 2).
              </p>
              <p>
                Die Daten werden sorgfältig behandelt, nicht weitergegeben und
                ausschließlich zu wissenschaftlichen und/oder aktivistischen
                Zwecken verwendet, die die Wohnungsnot thematisieren.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  ),
  buttons: {
    forward: {
      text: `Weiter`,
      checkInvalid: (configuration: Configuration) => {
        const checks = {
          contactData: {
            firstName: 'deinen Vornamen',
            lastName: 'deinen Nachnamen',
            street: 'deine Straße',
            houseNumber: 'deine Hausnummer',
            postcode: 'deine Postleitzahl',
            city: 'deine Stadt',
            telephone: 'deine Telefonnummer',
            eMail: 'deine E-Mail'
          }
        };

        if (configuration.immobilienScout24.useAccount === USEACCOUNT.JA) {
          checks.immobilienScout24 = {
            userName: 'deine E-Mail',
            password: 'dein Passwort'
          };
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const [groupName, group] of Object.entries(checks)) {
          // eslint-disable-next-line no-restricted-syntax
          for (const field in group) {
            if (!Object.prototype.hasOwnProperty.call(group, field)) {
              // eslint-disable-next-line no-continue
              continue;
            }

            if (
              !configuration[groupName][field] ||
              configuration[groupName][field].length === 0
            ) {
              return `Bitte gib ${group[field]} an`;
            }
          }
        }

        if (!configuration.additionalInformation.income) {
          return 'Bitte gib dein Einkommen an';
        }

        return false;
      }
    }
  }
};
export default personalDataStage;
