// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import styles from './Configuration.scss';
import type { configurationStateType } from '../reducers/configuration';
import PostcodeMap from './PostcodeMap';

type ElementDescription = {
  text: string | Node | ((props: Props) => Node),
  className?: string,
  style?: { [key: string]: string | number }
};
type ButtonDescription = ElementDescription;
type StageDescription = {
  container?: {
    className?: string
  },
  title: ElementDescription,
  body: ElementDescription,
  buttons: {
    forward: ButtonDescription,
    backwards?: ButtonDescription
  }
};

const stages: Array<StageDescription> = [
  {
    title: {
      text: 'Der Wohnungsbot.',
      className: `${styles.fadeIn} ${styles.largeTitle}`,
      style: { animationDuration: '4s', animationDelay: '1s' }
    },
    body: {
      text: `Willkommen beim »Von einem der auszog eine Wohnung in Berlin zu
          finden. Ein Automatisierungs­drama in drei Akten — 2. Akt: Das
          Versprechen des Bots.«, einem Projekt von Clemens Schöll im Rahmen von
          48 Stunden Neukölln 2019.`,
      className: `${styles.fadeIn}`,
      style: { animationDuration: '2s', animationDelay: '1s' }
    },
    buttons: {
      forward: {
        text: `Los geht's`,
        className: `${styles.fadeIn}`,
        style: { animationDuration: '1s', animationDelay: '6s' }
      }
    }
  },
  {
    title: {
      text: 'Deinen Bot konfigurieren'
    },
    body: {
      text: (
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
      )
    },
    buttons: {
      forward: {
        text: `Jetzt konfigurieren`
      }
    }
  },
  {
    title: {
      text: 'Suchbereich festlegen'
    },
    container: {
      className: `${styles.wide} ${styles.high}`
    },
    body: {
      text: ({ togglePostcode, configuration: { postcodes } }: Props) => (
        <div>
          <div style={{ display: 'flex' }}>
            <div>
              Wähle Bereiche in denen du nach Wohnungen suchen möchtest in dem
              du auf sie klickst — {postcodes.length} Postleitzahl-Bezirke
              ausgewählt
              <br />
              <small>{postcodes.join(', ')}</small>
            </div>
            <button type="button" style={{ marginLeft: 'auto' }}>
              Zurücksetzen <span className="material-icons">replay</span>{' '}
            </button>
          </div>
          <br />
          <br />
          <PostcodeMap
            togglePostcodeSelected={togglePostcode}
            selectedPostcodes={postcodes}
          />
        </div>
      )
    },
    buttons: {
      forward: {
        text: `Weiter`
      }
    }
  },
  {
    title: {
      text: 'Bereit für die Wohnungssuche?'
    },
    body: {
      text: ({ configuration }: Props) => (
        <>
          Das ist dein Suchprofil:
          <pre
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(configuration, null, 2)
            }}
            style={{ maxHeight: 200 }}
          />
        </>
      )
    },
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

    return (
      <div className={styles.container} data-tid="container">
        <div
          className={`${styles.innerContainer} ${
            stage.container ? stage.container.className || '' : ''
          }`}
        >
          <main>
            <h2 className={stage.title.className} style={stage.title.style}>
              {this.renderAmbiguous(stage.title.text)}
            </h2>

            <div className={stage.body.className}>
              {this.renderAmbiguous(stage.body.text)}
            </div>
          </main>
          <div className={styles.buttons}>
            <button
              type="button"
              onClick={
                configuration.stage === stages.length - 1
                  ? hideConfiguration
                  : nextStage
              }
              className={`primary ${stage.buttons.forward.className || ''}`}
              style={stage.buttons.forward.style}
            >
              {this.renderAmbiguous(stage.buttons.forward.text)}{' '}
              <span className="material-icons">arrow_forward</span>
            </button>
            {configuration.stage > 0 ? (
              <button
                type="button"
                style={{ marginRight: 'auto' }}
                onClick={previousStage}
              >
                <span className="material-icons">arrow_backward</span>
                Zurück
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
