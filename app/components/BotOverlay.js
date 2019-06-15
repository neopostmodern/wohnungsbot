// @flow
import React, { Component } from 'react';
import styles from './BotOverlay.scss';
// $FlowFixMe - flow doesn't like SVG
import BotIllustration from '../../resources/bot.svg';
// $FlowFixMe - flow doesn't like SVG
import BotIllustrationActive from '../../resources/bot-active.svg';
import type { anyAnimation, ElementBoundingBox } from '../reducers/overlay';
import type { Verdict, Verdicts } from '../reducers/data';
import VerdictComponent from './util/Verdict';

type Props = {
  isPuppetLoading: boolean,
  animations: Array<anyAnimation>,
  overviewBoundingBoxes: Array<ElementBoundingBox>,
  privacyMaskBoundingBoxes: Array<ElementBoundingBox>,
  verdicts: Verdicts,
  isBotActing: boolean,
  botMessage: string,
  showOverlay: boolean,
  alreadyAppliedFlatIds: Array<string>,
  performScroll: (name: 'puppet', deltaY: number) => void
};

export default class BotOverlay extends Component<Props> {
  props: Props;

  static renderAnimations(animations: Array<anyAnimation>) {
    return (
      <div className={styles.animations}>
        {animations.map(animation => {
          if (animation.type === 'click') {
            return (
              <div
                key={animation.animationId}
                id={animation.animationId}
                style={{ left: animation.x, top: animation.y }}
                className={styles.clickAnimation}
              />
            );
          }

          console.error(
            `Unknown animation: ${animation.type} (${animation.animationId})`
          );
          return null;
        })}
      </div>
    );
  }

  constructor() {
    super();

    // eslint-disable-next-line flowtype/no-weak-types
    (this: any).handleWheel = this.handleWheel.bind(this);
  }

  handleWheel(event: WheelEvent) {
    const { isBotActing, performScroll } = this.props;

    if (isBotActing) {
      return;
    }

    performScroll('puppet', Math.sign(event.deltaY) * 30);
  }

  botTalk(): string {
    const {
      isPuppetLoading,
      botMessage,
      verdicts,
      alreadyAppliedFlatIds
    } = this.props;

    if (isPuppetLoading) {
      return `Website lädt...`;
    }

    if (botMessage) {
      return botMessage;
    }

    // eslint-disable-next-line flowtype/no-weak-types
    const matchedFlats = ((Object.values(verdicts): any): Array<Verdict>)
      .filter(({ result }) => result)
      .map(({ flatId }) => flatId);

    const notAppliedYetFlats = matchedFlats.filter(
      flatId => !alreadyAppliedFlatIds.includes(flatId)
    );

    if (matchedFlats.length > 0) {
      return `${notAppliedYetFlats.length} neue passende Wohnungen gefunden (${
        matchedFlats.length
      } insgesamt).`;
    }

    return 'Ich bin bereit, aber es gibt keine Wohnungen!';
  }

  render() {
    const {
      animations,
      overviewBoundingBoxes,
      privacyMaskBoundingBoxes,
      verdicts,
      isBotActing,
      showOverlay,
      alreadyAppliedFlatIds
    } = this.props;

    return (
      <div
        className={styles.container}
        data-tid="container"
        onWheel={this.handleWheel}
      >
        {BotOverlay.renderAnimations(animations)}
        {showOverlay
          ? overviewBoundingBoxes.map(
              ({ boundingBox, attachedInformation: { flatId } }) => (
                <div
                  key={flatId}
                  className={styles.verdictOverlayWrapper}
                  style={{
                    top: boundingBox.top,
                    left: boundingBox.left,
                    width: boundingBox.width,
                    height: boundingBox.height
                  }}
                >
                  <VerdictComponent
                    flatId={flatId}
                    verdict={verdicts[flatId]}
                    isAlreadyApplied={alreadyAppliedFlatIds.includes(flatId)}
                  />
                </div>
              )
            )
          : null}

        {privacyMaskBoundingBoxes.map(({ selector, boundingBox }) => (
          <div
            key={selector}
            className={styles.privacyMask}
            style={{
              top: boundingBox.top,
              left: boundingBox.left,
              width: boundingBox.width,
              height: boundingBox.height
            }}
          />
        ))}

        <img
          src={isBotActing ? BotIllustrationActive : BotIllustration}
          alt="bot"
          className={styles.botIllustration}
        />
        <div className={styles.speechBubble}>{this.botTalk()}</div>
      </div>
    );
  }
}
