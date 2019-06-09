import React from 'react';
import styles from '../Configuration.scss';
import { NumberField } from './util';
import { AllFloors } from '../../reducers/configuration';
import { floorToName } from '../../utils/germanStrings';
import type { configurationStateType } from '../../reducers/configuration';
import type { InheritedProps, StageDescription } from './types';

const flatDescriptionStage: StageDescription = {
  container: {
    className: styles.high
  },
  title: 'Was suchst du?',
  subtitle: (
    <>
      Jetzt geht es darum die Wohnung nach der du suchst zu beschreiben —
      zumindest das, was sich in Zahlen ausdrücken lässt.
    </>
  ),
  body: ({
    configuration: {
      floors,
      onlyOldBuilding,
      onlyUnfurnished,
      hasWBS,
      mustHaveBalcony,
      mustHaveKitchenette,
      noKitchenette,
      maximumRent,
      minimumArea,
      minimumRooms,
      maximumRooms
    },
    toggleFloor,
    toggleBoolean,
    setNumber
  }: InheritedProps) => (
    <div className={styles.row}>
      <div className={styles.column}>
        <h3>Preis und Größe</h3>
        <div className={styles.searchParameter}>
          Bis zu{' '}
          <NumberField
            value={maximumRent}
            onChange={value => setNumber('maximumRent', value)}
          />
          € Kaltmiete
        </div>
        <div className={styles.searchParameter}>
          Mindestens
          <NumberField
            value={minimumArea}
            onChange={value => setNumber('minimumArea', value)}
          />
          m²
        </div>
        <div className={styles.searchParameter}>
          <NumberField
            value={minimumRooms}
            onChange={value => setNumber('minimumRooms', value)}
            step={0.5}
          />
          bis
          <NumberField
            value={maximumRooms}
            onChange={value => setNumber('maximumRooms', value)}
            step={0.5}
          />{' '}
          Zimmer
        </div>
        <h3 style={{ marginTop: '3rem' }}>
          Hast du einen Wohnberechtigungsschein?
        </h3>
        <input
          type="checkbox"
          checked={hasWBS}
          onChange={() => toggleBoolean('hasWBS')}
        />{' '}
        Ja &nbsp;&nbsp;
        <input
          type="checkbox"
          checked={!hasWBS}
          onChange={() => toggleBoolean('hasWBS')}
        />{' '}
        Nein
        <div style={{ marginTop: '0.5em', lineHeight: 0.9 }}>
          <small>
            Aktuell kann der Bot leider nicht zwischen &quot;WBS&quot; und
            &quot;WBS mit besonderem Wohnbedarf&quot; unterscheiden
          </small>
        </div>
        <h3 style={{ marginTop: '3rem' }}>Sonstige Wünsche</h3>
        <div className={styles.searchParameter}>
          <input
            type="checkbox"
            checked={onlyOldBuilding}
            onChange={() => toggleBoolean('onlyOldBuilding')}
          />{' '}
          Unbedingt Altbau (vor 1950 errichtet)
        </div>
        <div className={styles.searchParameter}>
          <input
            type="checkbox"
            checked={mustHaveBalcony}
            onChange={() => toggleBoolean('mustHaveBalcony')}
          />{' '}
          Unbedingt mit Balkon / Terasse
        </div>
        <div className={styles.searchParameter}>
          <input
            type="checkbox"
            checked={mustHaveKitchenette}
            onChange={() => toggleBoolean('mustHaveKitchenette')}
          />{' '}
          Unbedingt <em>mit</em> Einbauküche
        </div>
        <div className={styles.searchParameter}>
          <input
            type="checkbox"
            checked={noKitchenette}
            onChange={() => toggleBoolean('noKitchenette')}
          />{' '}
          Unbedingt <em>ohne</em> Einbauküche
        </div>
        <div className={styles.searchParameter}>
          <input
            type="checkbox"
            checked={onlyUnfurnished}
            onChange={() => toggleBoolean('onlyUnfurnished')}
          />{' '}
          Unbedingt unmöbliert
        </div>
        <small>
          Die Verlässlichkeit dieser Angaben bei den Inseraten ist leider nicht
          besonders hoch
        </small>
      </div>
      <div className={styles.column}>
        <h3>Stockwerk</h3>
        <div className={styles.roof}>
          <div className={styles.roofLeft} />
          <div className={styles.roofMiddle} />
          <div className={styles.roofRight} />
        </div>
        <div className={styles.house}>
          {AllFloors.map(floor => (
            <div
              className={`${styles.floor} ${
                floors.includes(floor) ? styles.selected : ''
              }`}
              onClick={() => toggleFloor(floor)}
              key={floor}
            >
              {floorToName(floor, 4)}
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  buttons: {
    forward: {
      text: `Weiter`,
      checkInvalid: (configuration: configurationStateType) => {
        if (configuration.floors.length === 0) {
          return 'Wähle mindestens ein Stockwerk aus';
        }

        return false;
      }
    }
  }
};

export default flatDescriptionStage;
