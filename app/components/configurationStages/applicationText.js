import React from 'react';
import styles from '../Configuration.scss';
import type { InheritedProps, StageDescription } from './types';
import applicationTextBuilder from '../../flat/applicationTextBuilder';
import APPLICATION_TEMPLATES from '../../constants/applicationTemplates';
import type { FlatAddress, FlatContactDetails } from '../../reducers/data';
import Textarea from '../inputs/Textarea';

type ApplicationTextPreviewsProps = {
  applicationText: string
};
type ApplicationTextPreviewsState = {
  previewIndex: number
};
class ApplicationTextPreviews extends React.Component<
  ApplicationTextPreviewsProps,
  ApplicationTextPreviewsState
> {
  props: ApplicationTextPreviewsProps;

  state: ApplicationTextPreviewsState;

  static TestFlats: Array<{
    address: FlatAddress,
    contact: FlatContactDetails
  }> = [
    {
      address: {
        street: 'Hermannstr.',
        houseNumber: '177',
        neighborhood: 'Neukölln',
        postcode: '12051'
      },
      contact: {
        firstName: 'Helga',
        lastName: 'Schneider',
        salutation: 'FEMALE'
      }
    },
    {
      address: {
        street: 'Richardplatz',
        neighborhood: 'Neukölln',
        postcode: '12055'
      },
      contact: {
        salutation: 'NO_SALUTATION'
      }
    },
    {
      address: {
        neighborhood: 'Neukölln',
        postcode: '12049'
      },
      contact: {
        salutation: 'MALE',
        firstName: 'Richard',
        lastName: 'Meier'
      }
    }
  ];

  constructor() {
    super();

    this.state = {
      previewIndex: 0
    };

    setInterval(
      () =>
        this.setState((previousState: ApplicationTextPreviewsState) => ({
          previewIndex:
            (previousState.previewIndex + 1) %
            ApplicationTextPreviews.TestFlats.length
        })),
      5000
    );
  }

  render() {
    const { applicationText } = this.props;
    const { previewIndex } = this.state;

    return (
      <>
        <pre className={styles.applicationTextPreview}>
          {applicationTextBuilder(
            applicationText,
            ApplicationTextPreviews.TestFlats[previewIndex].address,
            ApplicationTextPreviews.TestFlats[previewIndex].contact
          )}
        </pre>
        <div className={styles.comment}>
          Beispiel {previewIndex + 1} von{' '}
          {ApplicationTextPreviews.TestFlats.length}
        </div>
      </>
    );
  }
}

const applicationTextStage: StageDescription = {
  container: {
    className: styles.high
  },
  title: 'Dein Anschreiben',
  subtitle: (
    <>
      Ein persönlich wirkendes Anschreiben ist sehr wichtig. Der Bot kann das
      teilweise für dich übernehmen — verwende dafür die bereitgestellten
      Ersetzungen!
    </>
  ),
  body: ({ configuration: { applicationText }, setString }: InheritedProps) => (
    <div className={styles.marginBottom}>
      <div className={styles.row}>
        <div className={styles.column}>
          <h3>Deine Textvorlage</h3>
          <Textarea
            onChange={text => setString('applicationText', text)}
            value={applicationText}
          />
          <h3>Verfügbare Ersetzungen</h3>
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
        </div>
        <div className={styles.column}>
          <h3>Wie der Bot ihn abgeschickt</h3>
          <ApplicationTextPreviews applicationText={applicationText} />
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
