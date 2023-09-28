import React from "react";
import styles from "../Configuration.scss";
import { AllFloors, MOVE_IN_WHEN, MOVE_IN_WHO } from "../../reducers/configuration";
import { floorToName } from "../../utils/germanStrings";
import type { Configuration } from "../../reducers/configuration";
import type { InheritedProps, StageDescription } from "./types";
import Disclaimer from "./disclaimer";
import TextField from "../inputs/TextInput";
import NumberField from "../inputs/NumberField";
import EnumField from "../inputs/EnumField";
const flatDescriptionStage: StageDescription = {
  container: {
    className: styles.high
  },
  title: 'Was suchst du?',
  subtitle: <>
      Jetzt geht es darum die Wohnung, nach der du suchst, zu beschreiben —
      zumindest das, was sich in Zahlen ausdrücken lässt.
    </>,
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
        noSwapApartment,
        notSpecificallyForSeniors,
        onlySublease,
        noSublease,
        maximumRent,
        minimumArea,
        maximumRentPerSquareMeter,
        minimumRooms,
        maximumRooms
      },
      additionalInformation: {
        moveInWho,
        animals,
        moveInWhen
      },
      experimentalFeatures: {
        sortByNewest
      }
    },
    toggleFloor,
    toggleBoolean,
    setNumber,
    setString
  }: InheritedProps) => <div className={styles.marginBottom}>
      <div className={styles.row}>
        <div className={styles.column}>
          <h3>Preis und Größe</h3>
          <div className={styles.searchParameter}>
            Bis zu{' '}
            <NumberField value={maximumRent} onChange={value => setNumber('filter.maximumRent', value)} />
            € Kaltmiete
          </div>
          <div className={styles.searchParameter}>
            Mindestens{' '}
            <NumberField value={minimumArea} onChange={value => setNumber('filter.minimumArea', value)} />
            m²
          </div>
          <div className={styles.searchParameter}>
            Maximal{' '}
            <NumberField value={maximumRentPerSquareMeter} onChange={value => setNumber('filter.maximumRentPerSquareMeter', value)} />
            € / m² (Kaltmiete)
          </div>
          <div className={styles.searchParameter}>
            <NumberField value={minimumRooms} onChange={value => setNumber('filter.minimumRooms', value)} step={0.5} />{' '}
            bis{' '}
            <NumberField value={maximumRooms} onChange={value => setNumber('filter.maximumRooms', value)} step={0.5} />{' '}
            Zimmer
          </div>
          <div className={styles.comment}>
            Nicht alle Felder müssen ausgefüllt werden.
          </div>
          <h3>Hast du einen Wohnberechtigungsschein?</h3>
          <input type="checkbox" checked={hasWBS} onChange={() => toggleBoolean('filter.hasWBS')} />{' '}
          Ja &nbsp;&nbsp;
          <input type="checkbox" checked={!hasWBS} onChange={() => toggleBoolean('filter.hasWBS')} />{' '}
          Nein
          <div style={{
          marginTop: '0.5em',
          lineHeight: 0.9
        }}>
            <small>
              Aktuell kann der Bot leider nicht zwischen &quot;WBS&quot; und
              &quot;WBS mit besonderem Wohnbedarf&quot; unterscheiden.
            </small>
          </div>
          <h3>Sonstige Wünsche</h3>
          <div className={styles.searchParameter}>
            <input type="checkbox" checked={onlyOldBuilding} onChange={() => toggleBoolean('filter.onlyOldBuilding')} />{' '}
            Unbedingt Altbau (vor 1950 errichtet)
          </div>
          <div className={styles.searchParameter}>
            <input type="checkbox" checked={mustHaveBalcony} onChange={() => toggleBoolean('filter.mustHaveBalcony')} />{' '}
            Unbedingt mit Balkon / Terasse
          </div>
          <div className={styles.searchParameter}>
            <input type="checkbox" checked={mustHaveKitchenette} onChange={() => toggleBoolean('filter.mustHaveKitchenette')} />{' '}
            Unbedingt <em>mit</em> Einbauküche
          </div>
          <div className={styles.searchParameter}>
            <input type="checkbox" checked={noKitchenette} onChange={() => toggleBoolean('filter.noKitchenette')} />{' '}
            Unbedingt <em>ohne</em> Einbauküche
          </div>
          <div className={styles.searchParameter}>
            <input type="checkbox" checked={noSwapApartment} onChange={() => toggleBoolean('filter.noSwapApartment')} />{' '}
            Unbedingt <em>keine</em> Tauschwohnung
          </div>
          <div className={styles.searchParameter}>
            <input type="checkbox" checked={notSpecificallyForSeniors} onChange={() => toggleBoolean('filter.notSpecificallyForSeniors')} />{' '}
            Keine Senioren-Wohnungen
          </div>
          <div className={styles.searchParameter}>
            <input type="checkbox" checked={onlySublease} onChange={() => toggleBoolean('filter.onlySublease')} />{' '}
            Unbedingt Zwischenmiete
          </div>
          <div className={styles.searchParameter}>
            <input type="checkbox" checked={noSublease} onChange={() => toggleBoolean('filter.noSublease')} />{' '}
            Unbedingt <em>keine</em> Zwischenmiete
          </div>
          <div className={styles.searchParameter}>
            <input type="checkbox" checked={onlyUnfurnished} onChange={() => toggleBoolean('filter.onlyUnfurnished')} />{' '}
            Unbedingt unmöbliert
          </div>
          <div className={styles.comment}>
            Die Verlässlichkeit dieser Angaben bei den Inseraten ist leider
            nicht besonders hoch.
            <br />
            Außerdem grenzt jeder weitere Filter natürlich die Treffer weiter
            ein — wenn du zu wenig Wohnungen findest solltest du also in
            Erwägung ziehen, hier etwas flexibler zu sein.
          </div>
        </div>
        <div className={styles.column}>
          <h3>Wer soll einziehen?</h3>
          <EnumField value={moveInWho} options={MOVE_IN_WHO} onChange={value => setString('additionalInformation.moveInWho', value)} isWeird />

          <h3>Mit Tieren?</h3>
          <TextField value={animals} onChange={value => setString('additionalInformation.animals', value)} placeholder="Beschreibung der Tiere" style={{
          width: '300px'
        }} />

          <h3>Ab wann?</h3>
          <EnumField value={moveInWhen} options={MOVE_IN_WHEN} onChange={value => setString('additionalInformation.moveInWhen', value)} inline />

          <h3>Stockwerk</h3>
          <div className={styles.roof}>
            <div className={styles.roofLeft} />
            <div className={styles.roofMiddle} />
            <div className={styles.roofRight} />
          </div>
          <div className={styles.house}>
            {AllFloors.map(floor => <div className={`${styles.floor} ${floors.includes(floor) ? styles.selected : styles.notSelected}`} onClick={() => toggleFloor(floor)} key={floor}>
                {floorToName(floor, 4)}
              </div>)}
          </div>
          <div className={styles.comment}>
            Aktuelle Auswahl:{' '}
            {floors.length === AllFloors.length ? 'Alle Stockwerke' : floors.slice().reverse().map(floor => floorToName(floor, 4)).join(', ')}
          </div>

          <h3>Experimentelle Fähigkeiten</h3>
          <div className={styles.comment}>
            Folgende Fähigkeiten sind sehr nützlich und können zu den besten
            Ergebnissen führen. Allerdings stürzt der Bot dabei manchmal ab,
            deshalb sind diese Fähigkeiten standardmäßig nicht aktiviert.
          </div>
          <div className={styles.searchParameter}>
            <input type="checkbox" checked={sortByNewest} onChange={() => toggleBoolean('experimentalFeatures.sortByNewest')} />{' '}
            Wohnungen nach "Neueste zuerst" sortieren
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>,
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