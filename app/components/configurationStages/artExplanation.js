import React from 'react';
import styles from '../Configuration.scss';
import type { InheritedProps, StageDescription } from './types';

const configurationExplanationStage: StageDescription = {
  title: '',
  body: ({
    configuration: {
      policies: { artConsent }
    },
    toggleBoolean
  }: InheritedProps) => (
    <>
      <h2>Kunst?</h2>
      <span>
        Du hast vielleicht gehört, dass dieser Bot dir helfen kann, eine Wohnung
        zu finden — und das stimmt auch!
        <br />
        <br />
        Aber ursprünglich und hauptsächlich ist dieser Bot Teil eines
        Kunstprojekts und einer Ausstellung.
        <br />
        Diese Software ist kein Produkt, sie ist ein Exponat. Vielleicht
        funktioniert sie nicht, oder anders als erwartet. Vielleicht ist es
        interessant, wenn sie anders funktioniert als erwartet. Vielleicht kann
        ich dir bei Problemen helfen (lege dazu am besten ein &quot;Issue&quot;{' '}
        <a
          href="https://github.com/neopostmodern/wohnungsbot/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          auf GitHub
        </a>{' '}
        an), vielleicht auch nicht.
        <br />
        <br />
        Bitte bestätige also folgendes:
        <br />
        <div className={styles.checkboxWithLabel}>
          <div>
            <input
              type="checkbox"
              value={artConsent}
              onChange={() => toggleBoolean('policies.artConsent')}
            />
          </div>
          <div>
            Ich habe verstanden, dass der Wohnungsbot ein Kunstprojekt ist. Ich
            habe keinen Anspruch darauf, dass der Bot funktioniert. Ich bin
            selbst verantwortlich, falls der Bot warum auch immer rechtswidrig
            handelt.
            <br />
            Eltern haften für ihre Kinder und ihre Bots.
          </div>
        </div>
        <br />
        <br />
        Mehr Informationen zu diesem Projekt findest du auf{' '}
        <a
          href="https://wohnung.neopostmodern.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          wohnung.neopostmodern.com
        </a>
        .
      </span>
    </>
  ),
  buttons: {
    forward: {
      text: `Konfigurieren`
    }
  }
};

export default configurationExplanationStage;
