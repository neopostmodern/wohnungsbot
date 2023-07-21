// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import styles from './Configuration.scss';
import type {
  configurationBoolean,
  configurationNumbers
} from '../reducers/configuration';
import { type Configuration as ConfigurationType } from '../reducers/configuration';
import stages from './configurationStages';
import type {
  FlexibleNode,
  StageDescription
} from './configurationStages/types';

type Props = {
  nextStage: () => void,
  previousStage: () => void,
  hideConfiguration: () => void,
  togglePostcode: (postcode: string) => void,
  resetPostcodes: () => void,
  toggleFloor: (floor: number) => void,
  toggleBoolean: (name: configurationBoolean) => void,
  setNumber: (name: configurationNumbers, value: ?number) => void,
  setString: (name: string, value: ?string) => void,
  resetConfiguration: () => void,
  configuration: ConfigurationType
};

export default class Configuration extends Component<Props> {
  props: Props;
  firstStart: Boolean;
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
    // Indicates lifecycle start. Needed so that configuration doesn't autohide anytime it's visible
    this.firstStart = true;
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
      const validationResult =
        stage.buttons.forward.checkInvalid(configuration);
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

    const {
      togglePostcode,
      resetPostcodes,
      toggleFloor,
      toggleBoolean,
      setNumber,
      setString,
      resetConfiguration,
      configuration
    } = this.props;

    if (typeof text === 'function') {
      return text({
        toggleBoolean,
        togglePostcode,
        toggleFloor,
        setNumber,
        setString,
        resetPostcodes,
        resetConfiguration,
        configuration
      });
    }

    return text;
  }

  render() {
    const { previousStage, configuration, hideConfiguration} = this.props;
    const stage: StageDescription = stages[configuration.stage];
    const { stageValid, validationMessage } = this.checkStageValid();

    if(configuration.policies.autostart && this.firstStart) {
      hideConfiguration();
    }
    //Prevent configuration hiding after checkbox is checked
    this.firstStart = false;
    return (
      <div
        className={`${styles.wrapper} ${
          stage.rootContainer ? stage.rootContainer.className : ''
        }`}
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
