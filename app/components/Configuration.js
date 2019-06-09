// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import styles from './Configuration.scss';
import type {
  configurationBoolean,
  configurationNumbers
} from '../reducers/configuration';
import {
  AllFloors,
  type configurationStateType
} from '../reducers/configuration';
import PostcodeMap from './PostcodeMap';
import { floorToName } from '../utils/germanStrings';

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
      checkInvalid?: configurationStateType => false | FlexibleNode
    },
    backwards?: ButtonDescription
  }
};

const valueToInt = (value: string) => {
  const parsedValue = parseFloat(value);

  if (Number.isNaN(parsedValue)) {
    return null;
  }

  return parsedValue;
};
const NumberField = ({
  value,
  onChange,
  ...props
}: {
  value: ?number,
  onChange: (value: ?number) => void
}) => (
  <input
    type="number"
    value={value === null ? '' : value}
    onChange={event => onChange(valueToInt(event.target.value))}
    {...props}
  />
);

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
    title: 'Wo suchst du?',
    subtitle: (
      <>
        Wähle Bereiche in denen du nach Wohnungen suchen möchtest, in dem du auf
        sie klickst. Dein aktueller Suchbereich ist dunkelgrün hinterlegt.
        <br />
        (Durch erneutes Klicken kannst du sie wieder abwählen)
      </>
    ),
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
            {postcodes.length} Postleitzahl-Bezirke ausgewählt
            <br />
            <small>{postcodes.join(', ')}&nbsp;</small>
          </div>

          <div className={styles.resetButton}>
            <button
              type="button"
              style={{ marginLeft: 'auto' }}
              onClick={resetPostcodes}
              disabled={postcodes.length === 0}
            >
              Zurücksetzen <span className="material-icons">replay</span>{' '}
            </button>
          </div>
        </div>
      </>
    ),
    buttons: {
      forward: {
        text: `Weiter`,
        checkInvalid: (configuration: configurationStateType) => {
          if (configuration.postcodes.length === 0) {
            return 'Wähle mindestens einen Bezirk aus';
          }

          return false;
        }
      }
    }
  },
  {
    container: {
      className: styles.high
    },
    title: 'Was suchst du?',
    subtitle: (
      <>
        Jetzt geht es darum die Wohnung nach der du suchst zu beschreiben —
        zumindest das, was sich in Zahlen ausdrücken lässt.
      </>
    ),
    body: ({
      configuration: {
        floors,
        onlyOldBuilding,
        onlyUnfurnished,
        hasWBS,
        mustHaveBalcony,
        mustHaveKitchenette,
        noKitchenette,
        maximumRent,
        minimumArea,
        minimumRooms,
        maximumRooms
      },
      toggleFloor,
      toggleBoolean,
      setNumber
    }: Props) => (
      <div className={styles.row}>
        <div className={styles.column}>
          <h3>Preis und Größe</h3>
          <div className={styles.searchParameter}>
            Bis zu{' '}
            <NumberField
              value={maximumRent}
              onChange={value => setNumber('maximumRent', value)}
            />
            € Kaltmiete
          </div>
          <div className={styles.searchParameter}>
            Mindestens
            <NumberField
              value={minimumArea}
              onChange={value => setNumber('minimumArea', value)}
            />
            m²
          </div>
          <div className={styles.searchParameter}>
            <NumberField
              value={minimumRooms}
              onChange={value => setNumber('minimumRooms', value)}
              step={0.5}
            />
            bis
            <NumberField
              value={maximumRooms}
              onChange={value => setNumber('maximumRooms', value)}
              step={0.5}
            />{' '}
            Zimmer
          </div>
          <h3 style={{ marginTop: '3rem' }}>
            Hast du einen Wohnberechtigungsschein?
          </h3>
          <input
            type="checkbox"
            checked={hasWBS}
            onChange={() => toggleBoolean('hasWBS')}
          />{' '}
          Ja &nbsp;&nbsp;
          <input
            type="checkbox"
            checked={!hasWBS}
            onChange={() => toggleBoolean('hasWBS')}
          />{' '}
          Nein
          <div style={{ marginTop: '0.5em', lineHeight: 0.9 }}>
            <small>
              Aktuell kann der Bot leider nicht zwischen &quot;WBS&quot; und
              &quot;WBS mit besonderem Wohnbedarf&quot; unterscheiden
            </small>
          </div>
          <h3 style={{ marginTop: '3rem' }}>Sonstige Wünsche</h3>
          <div className={styles.searchParameter}>
            <input
              type="checkbox"
              checked={onlyOldBuilding}
              onChange={() => toggleBoolean('onlyOldBuilding')}
            />{' '}
            Unbedingt Altbau (vor 1950 errichtet)
          </div>
          <div className={styles.searchParameter}>
            <input
              type="checkbox"
              checked={mustHaveBalcony}
              onChange={() => toggleBoolean('mustHaveBalcony')}
            />{' '}
            Unbedingt mit Balkon / Terasse
          </div>
          <div className={styles.searchParameter}>
            <input
              type="checkbox"
              checked={mustHaveKitchenette}
              onChange={() => toggleBoolean('mustHaveKitchenette')}
            />{' '}
            Unbedingt <em>mit</em> Einbauküche
          </div>
          <div className={styles.searchParameter}>
            <input
              type="checkbox"
              checked={noKitchenette}
              onChange={() => toggleBoolean('noKitchenette')}
            />{' '}
            Unbedingt <em>ohne</em> Einbauküche
          </div>
          <div className={styles.searchParameter}>
            <input
              type="checkbox"
              checked={onlyUnfurnished}
              onChange={() => toggleBoolean('onlyUnfurnished')}
            />{' '}
            Unbedingt unmöbliert
          </div>
          <small>
            Die Verlässlichkeit dieser Angaben bei den Inseraten ist leider
            nicht besonders hoch
          </small>
        </div>
        <div className={styles.column}>
          <h3>Stockwerk</h3>
          <div className={styles.roof}>
            <div className={styles.roofLeft} />
            <div className={styles.roofMiddle} />
            <div className={styles.roofRight} />
          </div>
          <div className={styles.house}>
            {AllFloors.map(floor => (
              <div
                className={`${styles.floor} ${
                  floors.includes(floor) ? styles.selected : ''
                }`}
                onClick={() => toggleFloor(floor)}
                key={floor}
              >
                {floorToName(floor, 4)}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    buttons: {
      forward: {
        text: `Weiter`,
        checkInvalid: (configuration: configurationStateType) => {
          if (configuration.postcodes.length === 0) {
            return 'Wähle mindestens einen Bezirk aus';
          }

          return false;
        }
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
  toggleFloor: (floor: number) => void,
  toggleBoolean: (name: configurationBoolean) => void,
  setNumber: (name: configurationNumbers, value: ?number) => void,
  configuration: configurationStateType
};

export default class Configuration extends Component<Props> {
  props: Props;

  constructor() {
    super();

    // eslint-disable-next-line flowtype/no-weak-types
    (this: any).handleKeyDown = this.handleKeyDown.bind(this);
    // eslint-disable-next-line flowtype/no-weak-types
    (this: any).goToNext = this.goToNext.bind(this);
  }

  componentDidMount() {
    // $FlowFixMe - flow thinks document.body could be undefined
    document.body.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    // $FlowFixMe - flow thinks document.body could be undefined
    document.body.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event: KeyboardEvent) {
    // todo: alternatively could confirm it's not currently targeting any input
    if (
      event.target === document.body &&
      event.key === 'Enter' &&
      this.checkStageValid().stageValid
    ) {
      this.goToNext();
    }
  }

  goToNext() {
    const {
      configuration: { stage },
      hideConfiguration,
      nextStage
    } = this.props;
    if (stage === stages.length - 1) {
      hideConfiguration();
    } else {
      nextStage();
    }
  }

  checkStageValid(): { stageValid: boolean, validationMessage: ?FlexibleNode } {
    const { configuration } = this.props;

    const stage: StageDescription = stages[configuration.stage];

    let stageValid = true;
    let validationMessage = null;
    if (stage.buttons.forward.checkInvalid) {
      const validationResult = stage.buttons.forward.checkInvalid(
        configuration
      );
      stageValid = validationResult === false;
      if (!stageValid) {
        validationMessage = validationResult;
      }
    }

    return { stageValid, validationMessage };
  }

  renderAmbiguous(text: ?FlexibleNode): string | Node {
    if (text === null || text === undefined) {
      return null;
    }

    if (typeof text === 'function') {
      return text(this.props);
    }

    return text;
  }

  render() {
    const { previousStage, configuration } = this.props;

    const stage: StageDescription = stages[configuration.stage];
    const { stageValid, validationMessage } = this.checkStageValid();

    return (
      <div
        className={styles.wrapper}
        data-tid="container"
        id="configurationContainer"
      >
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
              onClick={this.goToNext}
              className={`primary ${stage.buttons.forward.className || ''}`}
              style={stage.buttons.forward.style}
              disabled={!stageValid}
            >
              <div className={styles.buttonIcon}>
                <span className="material-icons">arrow_forward</span>
                {this.renderAmbiguous(stage.buttons.forward.text)}{' '}
                <div className={styles.validationError}>
                  {this.renderAmbiguous(validationMessage)}
                </div>
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
