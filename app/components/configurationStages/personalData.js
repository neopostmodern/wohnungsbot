import React from 'react';
import styles from '../Configuration.scss';
import { EMPLOYMENT_STATUS, SALUTATIONS } from '../../reducers/configuration';
import type { Configuration } from '../../reducers/configuration';
import type { InheritedProps, StageDescription } from './types';
import Disclaimer from './disclaimer';
import TextField from '../inputs/TextInput';
import NumberField from '../inputs/NumberField';
import EnumField from '../inputs/EnumField';

const twoTextFieldsInLineStyles = { width: '200px' };

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
      policies: { flatViewingNotificationMails, researchDataSharing }
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
            onChange={value => setString('contactData.salutation', value)}
            options={SALUTATIONS}
            inline
            isWeird
          />
          <div
            className={styles.searchParameter}
            style={{ marginTop: '0.5em' }}
          >
            <TextField
              value={firstName}
              onChange={value => setString('contactData.firstName', value)}
              placeholder="Vorname"
              style={twoTextFieldsInLineStyles}
            />{' '}
            <TextField
              value={lastName}
              onChange={value => setString('contactData.lastName', value)}
              placeholder="Nachname"
              style={twoTextFieldsInLineStyles}
            />
          </div>
          <div className={styles.searchParameter}>
            <TextField
              value={street}
              onChange={value => setString('contactData.street', value)}
              placeholder="Straße"
              style={{ width: '320px' }}
            />{' '}
            <TextField
              value={houseNumber}
              onChange={value => setString('contactData.houseNumber', value)}
              placeholder="Nr."
              style={{ width: '80px' }}
            />
          </div>
          <div className={styles.searchParameter}>
            <TextField
              value={postcode}
              onChange={value => setString('contactData.postcode', value)}
              placeholder="PLZ"
              style={{ width: '120px' }}
            />{' '}
            <TextField
              value={city}
              onChange={value => setString('contactData.city', value)}
              placeholder="Stadt"
              style={{ width: '280px' }}
            />
          </div>
          <div className={styles.searchParameter}>
            <TextField
              value={telephone}
              onChange={value => setString('contactData.telephone', value)}
              placeholder="Telefonnummer"
              style={twoTextFieldsInLineStyles}
            />{' '}
            <TextField
              value={eMail}
              onChange={value => setString('contactData.eMail', value)}
              placeholder="E-Mail"
              style={twoTextFieldsInLineStyles}
            />
          </div>
          <h3>
            Soll der Bot dich per E-Mail über öffentliche Termine für
            Massenbesichtigungen informieren?
          </h3>
          <input
            type="checkbox"
            checked={flatViewingNotificationMails}
            onChange={() =>
              toggleBoolean('policies.flatViewingNotificationMails')
            }
          />{' '}
          Ja &nbsp;&nbsp;
          <input
            type="checkbox"
            checked={!flatViewingNotificationMails}
            onChange={() =>
              toggleBoolean('policies.flatViewingNotificationMails')
            }
          />{' '}
          Nein
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
            onChange={value => setNumber('additionalInformation.income', value)}
            style={{ maxWidth: '100px' }}
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
            onChange={value =>
              setString('additionalInformation.employmentStatus', value)
            }
            isWeird
          />
          <h3>Dürfen anonyme Daten zu deiner Wohnungsnot gesammelt werden?</h3>
          <input
            type="checkbox"
            checked={researchDataSharing}
            onChange={() => toggleBoolean('policies.researchDataSharing')}
          />{' '}
          Ja &nbsp;&nbsp;
          <input
            type="checkbox"
            checked={!researchDataSharing}
            onChange={() => toggleBoolean('policies.researchDataSharing')}
          />{' '}
          Nein
          <div className={styles.comment}>
            <p>
              Um nicht nur im künstlerischen sondern auch im wissenschaftlichen
              Rahmen eine Aussage zur Wohnungsnot machen zu können, möchte der
              Bot folgende Informationen sammeln: (1) Wie viele Wohnungen in
              deinem Suchverlauf deinen Vorstellungen entsprechen, aber zu teuer
              sind; (2) Wie viel Prozent des Haushaltseinkommens du für deine
              Wohnung bereit bist zu zahlen.
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

        // eslint-disable-next-line no-restricted-syntax
        for (const group of Object.values(checks)) {
          // eslint-disable-next-line no-restricted-syntax
          for (const field in group) {
            if (!Object.prototype.hasOwnProperty.call(group, field)) {
              // eslint-disable-next-line no-continue
              continue;
            }

            if (
              !configuration.contactData[field] ||
              configuration.contactData[field].length === 0
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
