import React from 'react';
import styles from '../Configuration.scss';
import type { InheritedProps, StageDescription } from './types';
import { floorToName } from '../../utils/germanStrings';

const reviewStage: StageDescription = {
  container: {
    className: styles.high
  },
  title: 'Bereit für die Wohnungssuche?',
  subtitle: 'Überprüfe deine Suchprofil und dann kann es los gehen.',
  body: ({ configuration }: InheritedProps) => (
    <div className={styles.marginBottom}>
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
          {configuration.additionalInformation.animals ? (
            <>mit {configuration.additionalInformation.animals}</>
          ) : (
            <>ohne Tiere</>
          )}
          <h3>...nach einer Wohnung mit...</h3>
          {configuration.maximumRent ? (
            <>maximal {configuration.maximumRent}€</>
          ) : (
            <i>beliebig teurer</i>
          )}{' '}
          Kaltmiete
          <br />
          {configuration.minimumArea ? (
            <>mindestens {configuration.minimumArea}m²</>
          ) : (
            <i>beliebig großer</i>
          )}{' '}
          Wohnfläche
          <br />
          {configuration.minimumRooms || configuration.maximumRooms ? (
            <>
              {configuration.minimumRooms}&ndash;{configuration.maximumRooms}
            </>
          ) : (
            <i>beliebig vielen</i>
          )}{' '}
          Zimmern
          <br />
          in {configuration.postcodes.join(', ')}
          <br />
          im{' '}
          {configuration.floors
            .slice()
            .reverse()
            .map(floor => floorToName(floor, 4))
            .join(', ')}
          <br />
          <br />
          {configuration.mustHaveBalcony ? (
            <>
              mit Balkon
              <br />
            </>
          ) : null}{' '}
          {configuration.mustHaveKitchenette ? (
            <>
              mit Einbauküche
              <br />
            </>
          ) : null}{' '}
          {configuration.noKitchenette ? (
            <>
              ohne Einbauküche
              <br />
            </>
          ) : null}{' '}
          {configuration.onlyOldBuilding ? (
            <>
              Altbau
              <br />
            </>
          ) : null}{' '}
          {configuration.onlyUnfurnished ? (
            <>
              unmöbliert
              <br />
            </>
          ) : null}{' '}
        </div>
        <div className={styles.column}>
          <h3>...und schreibt...</h3>
          {/* todo: show application text */}
          <h3>Der Bot wird dabei...</h3>
          {configuration.policies.flatViewingNotificationMails ? null : (
            <>
              <em>keine</em>{' '}
            </>
          )}
          E-Mails mit Terminen für Massenbesichtigungen verschicken
          <br />
          <br />
          {configuration.policies.flatViewingNotificationMails ? null : (
            <>
              <em>keine</em>{' '}
            </>
          )}
          anonymen Daten zur Wohnungsnot sammeln
          <br />
        </div>
      </div>
    </div>
  ),
  buttons: {
    forward: {
      text: `Starten`
    }
  }
};

export default reviewStage;
