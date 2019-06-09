import React from 'react';
import type { InheritedProps, StageDescription } from './types';

const reviewStage: StageDescription = {
  title: 'Bereit für die Wohnungssuche?',
  subtitle: 'Überprüfe deine Suchprofil und dann kann es los gehen.',
  body: ({ configuration }: InheritedProps) => (
    <>
      Das ist dein Suchprofil:
      <pre
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(configuration, null, 2)
        }}
        style={{ maxHeight: 200 }}
      />
    </>
  ),
  buttons: {
    forward: {
      text: `Starten`
    }
  }
};

export default reviewStage;
