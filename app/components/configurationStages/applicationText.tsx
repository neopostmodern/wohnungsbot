import React from 'react';
import styles from '../Configuration.scss';
import type { InheritedProps, StageDescription } from './types';
import APPLICATION_TEMPLATES from '../../constants/applicationTemplates';
import Textarea from '../inputs/Textarea';
import ApplicationTextPreviews from '../util/ApplicationTextPreviews';

const applicationTextStage: StageDescription = {
  container: {
    className: styles.high
  },
  title: 'Dein Anschreiben',
  subtitle: (
    <>
      Ein persönlich wirkendes Anschreiben ist sehr wichtig. Der Bot kann das
      teilweise für dich übernehmen — verwende dafür die bereitgestellten, sich
      dynamisch anpassenden Textbausteine!
      <br />
      Und so funktioniert&apos;s: Du gibst <em>links</em> deinen Bewerbungstext{' '}
      <i>mit</i> Textbausteinen ein und kannst dann <em>rechts</em> Beispiele
      sehen, wie er an die entsprechenden Wohnungen und Ansprechpartner_innen
      angepasst wird.
    </>
  ),
  body: ({ configuration: { applicationText }, setString }: InheritedProps) => (
    <div className={styles.marginBottom}>
      <div className={styles.row}>
        <div className={styles.column}>
          <h3>Deine Textvorlage</h3>
          <Textarea
            onChange={(text) => setString('applicationText', text)}
            value={applicationText}
          />
          <h3>Verfügbare Textbausteine</h3>
          <div className={styles.searchParameter}>
            Anrede:{' '}
            <span className={styles.replacement}>
              {APPLICATION_TEMPLATES.SALUTATION}
            </span>
            <div className={styles.comment}>
              Beispiele: &quot;Sehr geehrte Frau Müller&quot;, &quot;Sehr
              geehrte Damen und Herren&quot;
            </div>
          </div>
          <div className={styles.searchParameter}>
            Ortsbeschreibung:{' '}
            <span className={styles.replacement}>
              {APPLICATION_TEMPLATES.IN_PLACE}
            </span>
            <div className={styles.comment}>
              Beispiele: &quot;in der Hermannstraße&quot;, &quot;am
              Richardplatz&quot;, &quot;in Neukölln&quot;
              <br />
              <br />
              Tipp: Auch der Passiv funktioniert hier sehr gut, zum Beispiel:
              &quot;die {APPLICATION_TEMPLATES.IN_PLACE} gelegene Wohnung&quot;
            </div>
          </div>
          <div className={styles.searchParameter}>
            Viertel:{' '}
            <span className={styles.replacement}>
              {APPLICATION_TEMPLATES.NEIGHBORHOOD}
            </span>
            <div className={styles.comment}>
              Beispiele: &quot;Neukölln&quot;, &quot;Kreuzberg&quot;
            </div>
          </div>
          <div
            className={styles.comment}
            style={{
              marginTop: '3rem'
            }}
          >
            Allgemeiner Tipp: Du kannst deine Bewerbungsunterlagen bei einem
            Cloud-Anbieter deiner Wahl hochladen und hier einen Link
            mitschicken!
          </div>
        </div>
        <div className={styles.column}>
          <h3>Wie der Bot ihn abgeschickt</h3>
          <ApplicationTextPreviews
            applicationText={applicationText}
            className={styles.applicationTextPreview}
          />
        </div>
      </div>
    </div>
  ),
  buttons: {
    forward: {
      text: `Weiter`
    }
  }
};
export default applicationTextStage;
