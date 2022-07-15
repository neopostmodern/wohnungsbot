import React from 'react';
import styles from '../Configuration.scss';
import type { InheritedProps, StageDescription } from './types';
import { floorToName } from '../../utils/germanStrings';
import JsonExport from '../util/JsonExport';
import ApplicationTextPreviews from '../util/ApplicationTextPreviews';

const reviewStage: StageDescription = {
  container: {
    className: styles.high
  },
  title: 'Bereit für die Wohnungssuche?',
  subtitle: 'Überprüfe deine Suchprofil und dann kann es los gehen.',
  body: ({ configuration, toggleBoolean }: InheritedProps) => (
    <div className={styles.marginBottom}>
      <div className={styles.announcement}>
        <h3>Wichtige Hinweise</h3>
        Der Bot funktioniert natürlich nur, solange dein Rechner eingeschaltet
        ist und das Programm &quot;Wohnungsbot&quot; läuft. Außerdem kann der
        Bot leider nur im Vordergrund aktiv sein — das heißt, dass das Fenster
        sich in den Vordergrund drängen wird{' '}
        <em>und während der Anfrage bleiben muss</em> um Wohnungen anschreiben
        zu können.
        <br />
        Da es aber oft wichtig ist unter den ersten Bewerber_innen zu sein,
        solltest du den Bot tagsüber (circa 7 — 23 Uhr) am besten durchgehend
        arbeiten lassen.
      </div>
      <br />
      <input
        type={'checkbox'}
        checked={configuration.policies.autostart}
        onChange={() => toggleBoolean('policies.autostart')}
      />{' '}
      Beim nächsten Start automatisch anfangen zu suchen
      <br />
      <br />
      <div className={styles.row}>
        <div className={styles.column}>
          <h3>Es sucht...</h3>
          {configuration.contactData.salutation}{' '}
          {configuration.contactData.firstName}{' '}
          {configuration.contactData.lastName}
          <br />
          {configuration.contactData.street}{' '}
          {configuration.contactData.houseNumber}
          <br />
          {configuration.contactData.postcode} {configuration.contactData.city}
          <br />
          <br />
          {configuration.contactData.telephone}
          <br />
          {configuration.contactData.eMail}
          <br />
          <br />
          {configuration.additionalInformation.employmentStatus}
          <br />
          {configuration.additionalInformation.income}€ Haushalts
          Netto-Einkommen
          <br />
          <br />
          als {configuration.additionalInformation.moveInWho}{' '}
          {configuration.additionalInformation.animals &&
          configuration.additionalInformation.animals !== 'Keine' ? (
            <>mit {configuration.additionalInformation.animals}</>
          ) : (
            <>ohne Tiere</>
          )}
          <br />
          <br />
          Einzug{' '}
          <span style={{ textTransform: 'lowercase' }}>
            {configuration.additionalInformation.moveInWhen}
          </span>
          <h3>...nach einer Wohnung mit...</h3>
          {configuration.filter.maximumRent ? (
            <>maximal {configuration.filter.maximumRent}€</>
          ) : (
            <i>beliebig teurer</i>
          )}{' '}
          Kaltmiete
          <br />
          {configuration.filter.minimumArea ? (
            <>mindestens {configuration.filter.minimumArea}m²</>
          ) : (
            <i>beliebig großer</i>
          )}{' '}
          Wohnfläche
          <br />
          {configuration.filter.maximumRentPerSquareMeter ? (
            <>maximal {configuration.filter.maximumRentPerSquareMeter}€/m²</>
          ) : (
            <i>beliebiger</i>
          )}{' '}
          Quadratmeterpreis (kalt)
          <br />
          <br />
          {configuration.filter.minimumRooms ||
          configuration.filter.maximumRooms ? (
            <>
              {configuration.filter.minimumRooms}&ndash;
              {configuration.filter.maximumRooms}
            </>
          ) : (
            <i>beliebig vielen</i>
          )}{' '}
          Zimmern
          <br />
          in {configuration.filter.postcodes.join(', ')}
          <br />
          im{' '}
          {configuration.filter.floors
            .slice()
            .reverse()
            .map((floor) => floorToName(floor, 4))
            .join(', ')}
          <br />
          <br />
          {configuration.filter.mustHaveBalcony ? (
            <>
              mit Balkon
              <br />
            </>
          ) : null}{' '}
          {configuration.filter.mustHaveKitchenette ? (
            <>
              mit Einbauküche
              <br />
            </>
          ) : null}{' '}
          {configuration.filter.noKitchenette ? (
            <>
              ohne Einbauküche
              <br />
            </>
          ) : null}{' '}
          {configuration.filter.noSwapApartment ? (
            <>
              keine Tauschwohnung
              <br />
            </>
          ) : null}{' '}
          {configuration.filter.notSpecificallyForSeniors ? (
            <>
              keine Seniorenwohnung
              <br />
            </>
          ) : null}{' '}
          {configuration.filter.noSublease ? (
            <>
              keine Wohnungen zur Zwischenmiete
              <br />
            </>
          ) : null}{' '}
          {configuration.filter.onlySublease ? (
            <>
              nur Wohnungen zur Zwischenmiete
              <br />
            </>
          ) : null}{' '}
          {configuration.filter.onlyOldBuilding ? (
            <>
              Altbau
              <br />
            </>
          ) : null}{' '}
          {configuration.filter.onlyUnfurnished ? (
            <>
              unmöbliert
              <br />
            </>
          ) : null}{' '}
        </div>
        <div className={styles.column}>
          <h3>...und schreibt...</h3>
          <ApplicationTextPreviews
            applicationText={configuration.applicationText}
            className={styles.applicationTextReview}
          />
          <h3>Der Bot wird dabei...</h3>
          {configuration.policies.fillAsLittleAsPossible ? (
            <em>möglichst wenig</em>
          ) : (
            <em>alle</em>
          )}{' '}
          Daten in Bewerbungsformulare eintragen
          <br />
          <br />
          {configuration.policies.applicationNotificationMails ? null : (
            <>
              <em>keine</em>{' '}
            </>
          )}
          E-Mails mit Benachrichtiungen über erfolgte Bewerbungen verschicken
          <br />
          <br />
          {configuration.policies.flatViewingNotificationMails ? null : (
            <>
              <em>keine</em>{' '}
            </>
          )}
          E-Mails mit Terminen für Massenbesichtigungen verschicken
          <br />
          <br />
          {configuration.immobilienScout24.useAccount ? (
            <>
              den ImmobilienScout24-Account{' '}
              <em>{configuration.immobilienScout24.userName}</em> verwenden
            </>
          ) : (
            <>
              <em>keinen</em> ImmobilienScout24-Account verwenden
            </>
          )}
          {/* <br /> */}
          {/* <br /> */}
          {/* {configuration.policies.researchDataSharing ? null : ( */}
          {/*  <> */}
          {/*    <em>keine</em>{' '} */}
          {/*  </> */}
          {/* )} */}
          {/* anonymen Daten zur Wohnungsnot sammeln */}
          <br />
          <br />
          {configuration.experimentalFeatures.sortByNewest ? (
            <>
              folgende experimentelle Fähigkeiten verwenden:
              <>
                <div>- Wohnungen sortieren nach "Neueste zuerst"</div>
              </>
            </>
          ) : (
            <>
              <em>keine</em> experimentellen Fähigkeiten verwenden
            </>
          )}
        </div>
      </div>
      <JsonExport serializableObject={configuration} />
    </div>
  ),
  buttons: {
    forward: {
      text: `Starten`
    }
  }
};

export default reviewStage;
