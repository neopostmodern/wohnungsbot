import React from 'react';
import styles from '../Configuration.scss';
import type { StageDescription } from './types';
const welcomeStage: StageDescription = {
  title: '',
  body: (
    <>
      <h1
        className={`${styles.fadeIn} ${styles.largeTitle}`}
        style={{
          animationDuration: '4s',
          animationDelay: '1s'
        }}
      >
        Der Wohnungsbot.
      </h1>
      <div
        className={styles.fadeIn}
        style={{
          animationDuration: '2s',
          animationDelay: '3s'
        }}
      >
        Willkommen bei
        <div
          style={{
            margin: '0.5em 0'
          }}
        >
          <i>
            Von einem der auszog eine Wohnung in Berlin zu finden.
            <br />
            Ein Automatisierungs­drama in drei Akten
            <br />
            2. Akt: Das Versprechen des Bots
          </i>
        </div>{' '}
        einem Kunst-Projekt von Clemens Schöll im Rahmen von 48 Stunden Neukölln
        2019.
        <br />
        <br />
      </div>
      <small
        className={styles.fadeIn}
        style={{
          animationDuration: '2s',
          animationDelay: '10s'
        }}
      >
        Um zu beginnen klicke oben rechts auf &quot;Los geht&apos;s&quot; und
        der Bot wird dich einführen.
      </small>
    </>
  ),
  buttons: {
    forward: {
      text: `Los geht's`,
      className: `${styles.fadeIn}`,
      style: {
        animationDuration: '1s',
        animationDelay: '6s'
      }
    }
  }
};
export default welcomeStage;
