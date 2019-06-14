import React from 'react';
import type { StageDescription } from './types';

const configurationExplanationStage: StageDescription = {
  title: '',
  body: (
    <>
      <h2>Deinen Bot konfigurieren</h2>
      <span>
        Um für dich nach Wohnungen zu suchen, muss dein Bot erst einmal wissen,
        wonach du eigentlich suchst!
        <br />
        In den nächsten Schritten hilft er dir, dein Suchprofil zu erstellen.
        <br /> <br />
        Und keine Sorge, deine Suchprofil-Daten verlassen deinen Computer nicht.
        Wenn du mir (und dem Bot) das nicht glauben willst, kannst du in{' '}
        <a
          href="https://github.com/neopostmodern/wohnungsbot"
          target="_blank"
          rel="noopener noreferrer"
        >
          den Quell-Code
        </a>{' '}
        schauen.
      </span>

      {/* todo: exhibition check box */}
    </>
  ),
  buttons: {
    forward: {
      text: `Konfigurieren`
    }
  }
};

export default configurationExplanationStage;
