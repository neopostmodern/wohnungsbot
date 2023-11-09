import React from 'react';
import styles from '../Configuration.scss';
import PostcodeMap from '../PostcodeMap';
import type { Configuration } from '../../reducers/configuration';
import type { InheritedProps, StageDescription } from './types';
const areaSelectionStage: StageDescription = {
  rootContainer: {
    className: `${styles.flexboxHack}`
  },
  title: 'Wo suchst du?',
  subtitle: (
    <>
      Wähle Bereiche, in denen du nach Wohnungen suchen möchtest, in dem du auf
      sie klickst. Dein aktueller Suchbereich ist dunkelgrün markiert. (Durch
      erneutes Klicken kannst du sie wieder abwählen.)
    </>
  ),
  body: ({
    togglePostcode,
    resetPostcodes,
    configuration: {
      filter: { postcodes }
    }
  }: InheritedProps) => (
    <>
      <PostcodeMap
        togglePostcodeSelected={togglePostcode}
        selectedPostcodes={postcodes}
      />
      <div className={styles.floating}>
        <div>
          {postcodes.length} Postleitzahl-Bezirke ausgewählt
          <br />
          <small>{postcodes.join(', ')}&nbsp;</small>
        </div>

        <div className={styles.resetButton}>
          <button
            type="button"
            style={{
              marginLeft: 'auto'
            }}
            onClick={resetPostcodes}
            disabled={postcodes.length === 0}
          >
            Zurücksetzen <span className="material-icons">replay</span>{' '}
          </button>
        </div>
      </div>
    </>
  ),
  buttons: {
    forward: {
      text: `Weiter`,
      checkInvalid: (configuration: Configuration) => {
        if (configuration.filter.postcodes.length === 0) {
          return 'Wähle mindestens einen Bezirk aus';
        }

        return false;
      }
    }
  }
};
export default areaSelectionStage;
