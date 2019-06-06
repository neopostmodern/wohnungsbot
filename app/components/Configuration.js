// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import styles from './Configuration.scss';
import type { configurationStateType } from '../reducers/configuration';
import PostcodeMap from './PostcodeMap';

type FlexibleNode = string | Node | ((props: Props) => Node);
type ElementDescription = {
  text: FlexibleNode,
  className?: string,
  style?: { [key: string]: string | number }
};
type ButtonDescription = ElementDescription;
type StageDescription = {
  container?: {
    className?: string
  },
  title?: FlexibleNode,
  subtitle?: FlexibleNode,
  body: FlexibleNode,
  buttons: {
    forward: ButtonDescription & {
      validator?: configurationStateType => boolean
    },
    backwards?: ButtonDescription
  }
};

const stages: Array<StageDescription> = [
  {
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
          Willkommen beim »Von einem der auszog eine Wohnung in Berlin zu
          finden. Ein Automatisierungs­drama in drei Akten — 2. Akt: Das
          Versprechen des Bots.«, einem Projekt von Clemens Schöll im Rahmen von
          48 Stunden Neukölln 2019.
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
  },
  {
    title: '',
    body: (
      <>
        <h2>Deinen Bot konfigurieren</h2>
        <span>
          Bevor dein Bot beginnen kann für dich nach Wohnungen zu suchen, muss
          muss er ersteinmal wissen, wonach du eigentlich suchst!
          <br />
          In den nächsten Schritten hilft er dir, dein Suchprofil zu erstellen.
          <br /> <br />
          Und keine Sorge, deine Suchprofil-Daten verlassen deinen Computer
          nicht. Wenn du mir (und dem Bot) das nicht glauben willst, kannst du
          in{' '}
          <a
            href="https://github.com/neopostmodern/wohnungsbot"
            target="_blank"
            rel="noopener noreferrer"
          >
            den Quell-Code
          </a>{' '}
          schauen.
        </span>
      </>
    ),
    buttons: {
      forward: {
        text: `Konfigurieren`
      }
    }
  },
  {
    container: {
      className: `${styles.wide} ${styles.high}`
    },
    title: 'Suchbereich festlegen',
    subtitle:
      'Wähle Bereiche in denen du nach Wohnungen suchen möchtest in dem du\n' +
      '            auf sie klickst',
    body: ({
      togglePostcode,
      resetPostcodes,
      configuration: { postcodes }
    }: Props) => (
      <>
        <PostcodeMap
          togglePostcodeSelected={togglePostcode}
          selectedPostcodes={postcodes}
        />
        <div className={styles.floating}>
          <div>
            {postcodes.length > 0 ? (
              <>{postcodes.length} Postleitzahl-Bezirke ausgewählt</>
            ) : (
              <>Wähle mindestens einen Postleitzahl-Bezirk durch klicken aus</>
            )}
            <br />
            <small>{postcodes.join(', ')}&nbsp;</small>
          </div>

          <button
            type="button"
            style={{ marginLeft: 'auto' }}
            onClick={resetPostcodes}
            disabled={postcodes.length === 0}
          >
            Zurücksetzen <span className="material-icons">replay</span>{' '}
          </button>
        </div>
      </>
    ),
    buttons: {
      forward: {
        text: `Weiter`,
        validator: (configuration: configurationStateType) =>
          configuration.postcodes.length > 0
      }
    }
  },
  {
    title: 'Bereit für die Wohnungssuche?',
    subtitle: 'Überprüfe deine Suchprofil und dann kann es los gehen.',
    body: ({ configuration }: Props) => (
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
  }
];

type Props = {
  nextStage: () => void,
  previousStage: () => void,
  hideConfiguration: () => void,
  togglePostcode: (postcode: string) => void,
  resetPostcodes: () => void,
  configuration: configurationStateType
};

export default class Configuration extends Component<Props> {
  props: Props;

  renderAmbiguous(
    text: string | Node | ((props: Props) => Node)
  ): string | Node {
    if (typeof text === 'function') {
      return text(this.props);
    }

    return text;
  }

  render() {
    const {
      nextStage,
      previousStage,
      hideConfiguration,
      configuration
    } = this.props;

    const stage: StageDescription = stages[configuration.stage];
    const stageValid = stage.buttons.forward.validator
      ? stage.buttons.forward.validator(configuration)
      : true;

    return (
      <div className={styles.wrapper} data-tid="container">
        <nav className={styles.navigation}>
          <div className={styles.buttonContainer}>
            <button
              type="button"
              style={{
                opacity: configuration.stage > 0 ? 1 : 0,
                pointerEvents: configuration.stage > 0 ? 'initial' : 'none'
              }}
              onClick={previousStage}
            >
              <div className={styles.buttonIcon}>
                <span className="material-icons">arrow_backward</span>
                Zurück
              </div>
            </button>
          </div>

          <div className={styles.header}>
            {configuration.stage > 1 &&
            configuration.stage < stages.length - 1 ? (
              <>
                Schritt {configuration.stage - 1} von {stages.length - 3}
              </>
            ) : (
              <>&nbsp;</>
            )}
            {stage.title ? <h2>{this.renderAmbiguous(stage.title)}</h2> : null}
            {stage.subtitle ? (
              <div>{this.renderAmbiguous(stage.subtitle)}</div>
            ) : null}
          </div>

          <div
            className={styles.buttonContainer}
            style={{ textAlign: 'right' }}
          >
            <button
              type="button"
              onClick={
                configuration.stage === stages.length - 1
                  ? hideConfiguration
                  : nextStage
              }
              className={`primary ${stage.buttons.forward.className || ''}`}
              style={stage.buttons.forward.style}
              disabled={!stageValid}
            >
              <div className={styles.buttonIcon}>
                <span className="material-icons">arrow_forward</span>
                {this.renderAmbiguous(stage.buttons.forward.text)}{' '}
              </div>
            </button>
          </div>
        </nav>
        <div className={styles.container}>
          <div
            className={`${styles.innerContainer} ${
              stage.container ? stage.container.className || '' : ''
            }`}
          >
            <main>{this.renderAmbiguous(stage.body)}</main>
          </div>
        </div>
      </div>
    );
  }
}
