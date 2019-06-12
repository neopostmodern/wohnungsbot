import React from 'react';
import styles from '../Configuration.scss';
import {
  AllFloors,
  MOVE_IN_WHEN,
  MOVE_IN_WHO
} from '../../reducers/configuration';
import { floorToName } from '../../utils/germanStrings';
import type { Configuration } from '../../reducers/configuration';
import type { InheritedProps, StageDescription } from './types';
import Disclaimer from './disclaimer';
import TextField from '../inputs/TextInput';
import NumberField from '../inputs/NumberField';
import EnumField from '../inputs/EnumField';

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
      filter: {
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
      additionalInformation: { moveInWho, animals, moveInWhen }
    },
    toggleFloor,
    toggleBoolean,
    setNumber,
    setString
  }: InheritedProps) => (
    <div className={styles.marginBottom}>
      <div className={styles.row}>
        <div className={styles.column}>
          <h3>Preis und Größe</h3>
          <div className={styles.searchParameter}>
            Bis zu{' '}
            <NumberField
              value={maximumRent}
              onChange={value => setNumber('filter.maximumRent', value)}
            />
            € Kaltmiete
          </div>
          <div className={styles.searchParameter}>
            Mindestens
            <NumberField
              value={minimumArea}
              onChange={value => setNumber('filter.minimumArea', value)}
            />
            m²
          </div>
          <div className={styles.searchParameter}>
            <NumberField
              value={minimumRooms}
              onChange={value => setNumber('filter.minimumRooms', value)}
              step={0.5}
            />
            bis
            <NumberField
              value={maximumRooms}
              onChange={value => setNumber('filter.maximumRooms', value)}
              step={0.5}
            />{' '}
            Zimmer
          </div>
          <h3>Hast du einen Wohnberechtigungsschein?</h3>
          <input
            type="checkbox"
            checked={hasWBS}
            onChange={() => toggleBoolean('filter.hasWBS')}
          />{' '}
          Ja &nbsp;&nbsp;
          <input
            type="checkbox"
            checked={!hasWBS}
            onChange={() => toggleBoolean('filter.hasWBS')}
          />{' '}
          Nein
          <div style={{ marginTop: '0.5em', lineHeight: 0.9 }}>
            <small>
              Aktuell kann der Bot leider nicht zwischen &quot;WBS&quot; und
              &quot;WBS mit besonderem Wohnbedarf&quot; unterscheiden
            </small>
          </div>
          <h3>Sonstige Wünsche</h3>
          <div className={styles.searchParameter}>
            <input
              type="checkbox"
              checked={onlyOldBuilding}
              onChange={() => toggleBoolean('filter.onlyOldBuilding')}
            />{' '}
            Unbedingt Altbau (vor 1950 errichtet)
          </div>
          <div className={styles.searchParameter}>
            <input
              type="checkbox"
              checked={mustHaveBalcony}
              onChange={() => toggleBoolean('filter.mustHaveBalcony')}
            />{' '}
            Unbedingt mit Balkon / Terasse
          </div>
          <div className={styles.searchParameter}>
            <input
              type="checkbox"
              checked={mustHaveKitchenette}
              onChange={() => toggleBoolean('filter.mustHaveKitchenette')}
            />{' '}
            Unbedingt <em>mit</em> Einbauküche
          </div>
          <div className={styles.searchParameter}>
            <input
              type="checkbox"
              checked={noKitchenette}
              onChange={() => toggleBoolean('filter.noKitchenette')}
            />{' '}
            Unbedingt <em>ohne</em> Einbauküche
          </div>
          <div className={styles.searchParameter}>
            <input
              type="checkbox"
              checked={onlyUnfurnished}
              onChange={() => toggleBoolean('filter.onlyUnfurnished')}
            />{' '}
            Unbedingt unmöbliert
          </div>
          <div className={styles.comment}>
            Die Verlässlichkeit dieser Angaben bei den Inseraten ist leider
            nicht besonders hoch
          </div>
        </div>
        <div className={styles.column}>
          <h3>Wer soll einziehen?</h3>
          <EnumField
            value={moveInWho}
            options={MOVE_IN_WHO}
            onChange={value =>
              setString('additionalInformation.moveInWho', value)
            }
            isWeird
          />

          <h3>Mit Tieren?</h3>
          <TextField
            value={animals}
            onChange={value =>
              setString('additionalInformation.animals', value)
            }
            placeholder="Beschreibung der Tiere"
            style={{ width: '300px' }}
          />

          <h3>Ab wann?</h3>
          <EnumField
            value={moveInWhen}
            options={MOVE_IN_WHEN}
            onChange={value =>
              setString('additionalInformation.moveInWhen', value)
            }
            inline
          />

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

      <Disclaimer />
    </div>
  ),
  buttons: {
    forward: {
      text: `Weiter`,
      checkInvalid: (configuration: Configuration) => {
        if (configuration.filter.floors.length === 0) {
          return 'Wähle mindestens ein Stockwerk aus';
        }

        return false;
      }
    }
  }
};

export default flatDescriptionStage;
