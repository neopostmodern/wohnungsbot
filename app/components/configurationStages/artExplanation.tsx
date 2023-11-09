import React from 'react';
import styles from '../Configuration.scss';
import type { InheritedProps, StageDescription } from './types';
import type { Configuration } from '../../reducers/configuration';
const configurationExplanationStage: StageDescription = {
  container: {
    className: styles.high
  },
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
        Außerdem muss natürlich klar sein, dass der Bot dir nicht magisch zu
        einer Wohnung verhelfen kann:
        <br />
        Er behebt weder den Wohnungsmangel noch, dass eventuell Vermieter_innen
        und Hausverwaltungen dich bei der Auswahl diskriminieren — um nur zwei
        der vielen anderen Probleme zu nennen, die es zur Zeit mit dem
        Wohnungsmarkt in Berlin gibt.
        <br />
        <br />
        Aber er kann uns zeigen, dass eine andere Form der Automatisierung
        möglich wäre, oder zumindest spekulieren und fragen, wie wir uns diese
        vorstellen und wünschen würden.
        <br />
        <br />
        Bitte bestätige also folgendes:
        <br />
        <div className={styles.checkboxWithLabel}>
          <div>
            <input
              type="checkbox"
              checked={artConsent}
              onChange={() => toggleBoolean('policies.artConsent')}
            />
          </div>
          <div>
            Ich habe verstanden, dass der Wohnungsbot ein Kunstprojekt ist. Ich
            habe keinen Anspruch darauf, dass der Bot funktioniert. Ich bin
            selbst verantwortlich, falls der Bot, warum auch immer, rechtswidrig
            handelt.
            <br />
            Eltern haften für ihre Kinder und ihre Bots.
          </div>
        </div>
        <br />
        <br />
        Mehr Informationen zu diesem Projekt findest du auf{' '}
        <a
          href="https://wohnungsbot.de"
          target="_blank"
          rel="noopener noreferrer"
        >
          wohnungsbot.de
        </a>
        .
      </span>
    </>
  ),
  buttons: {
    forward: {
      text: `Zur Konfiguration`,
      checkInvalid: (configuration: Configuration) => {
        if (!configuration.policies.artConsent) {
          return 'Bitte stimme zu.';
        }

        return false;
      }
    }
  }
};
export default configurationExplanationStage;
