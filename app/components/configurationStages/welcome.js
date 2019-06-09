import React from 'react';
import styles from '../Configuration.scss';
import type { StageDescription } from './types';

const welcomeStage: StageDescription = {
  title: '',
  body: (
    <>
      <h1
        className={`${styles.fadeIn} ${styles.largeTitle}`}
        style={{ animationDuration: '4s', animationDelay: '1s' }}
      >
        Der Wohnungsbot.
      </h1>
      <div
        className={styles.fadeIn}
        style={{ animationDuration: '2s', animationDelay: '3s' }}
      >
        Willkommen beim »Von einem der auszog eine Wohnung in Berlin zu finden.
        Ein Automatisierungs­drama in drei Akten — 2. Akt: Das Versprechen des
        Bots.«, einem Projekt von Clemens Schöll im Rahmen von 48 Stunden
        Neukölln 2019.
      </div>
    </>
  ),
  buttons: {
    forward: {
      text: `Los geht's`,
      className: `${styles.fadeIn}`,
      style: { animationDuration: '1s', animationDelay: '6s' }
    }
  }
};

export default welcomeStage;
