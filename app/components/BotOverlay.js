// @flow
import React, { Component } from 'react';
import styles from './BotOverlay.scss';
// $FlowFixMe - flow doesn't like SVG
import BotIllustration from '../../resources/bot.svg';
// $FlowFixMe - flow doesn't like SVG
import BotIllustrationActive from '../../resources/bot-active.svg';
import type { anyAnimation, ElementBoundingBox } from '../reducers/overlay';
import type { Verdicts } from '../reducers/data';
import { flatPageUrl } from '../flat/urlBuilder';

type Props = {
  isPuppetLoading: boolean,
  animations: Array<anyAnimation>,
  overviewBoundingBoxes: Array<ElementBoundingBox>,
  privacyMaskBoundingBoxes: Array<ElementBoundingBox>,
  verdicts: Verdicts,
  isBotActing: boolean,
  botMessage: string,
  showOverlay: boolean,
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
    const { isPuppetLoading, botMessage, verdicts } = this.props;

    if (isPuppetLoading) {
      return `Website lädt...`;
    }

    if (botMessage) {
      return botMessage;
    }

    // $FlowFixMe (flow can't handle Object.values)
    const matchedFlats = Object.values(verdicts).filter(({ result }) => result)
      .length;

    if (matchedFlats > 0) {
      return `${matchedFlats} passende Wohnungen gefunden.`;
    }

    return 'Ich bin bereit.';
  }

  render() {
    const {
      animations,
      overviewBoundingBoxes,
      privacyMaskBoundingBoxes,
      verdicts,
      isBotActing,
      showOverlay
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
                  className={styles.verdictOverlay}
                  style={{
                    top: boundingBox.top,
                    left: boundingBox.left,
                    width: boundingBox.width,
                    height: boundingBox.height
                  }}
                >
                  {verdicts[flatId] ? (
                    <>
                      <div className={styles.summary}>
                        <span
                          className={`material-icons standalone-icon ${
                            verdicts[flatId].result ? 'good' : 'bad'
                          }`}
                        >
                          {verdicts[flatId].result
                            ? 'thumb_up_alt'
                            : 'thumb_down_alt'}
                        </span>
                      </div>
                      <div>
                        {verdicts[flatId].reasons.map(({ reason, result }) => (
                          <div key={reason} className={styles.reason}>
                            <div className={styles.reasonIcon}>
                              <span
                                className={`material-icons standalone-icon ${
                                  result ? 'good' : 'bad'
                                }`}
                              >
                                {result ? 'check' : 'block'}
                              </span>
                            </div>
                            <div>{reason}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <i>Keine Informationen</i>
                  )}
                  <div className={styles.openInBrowser}>
                    <a
                      href={flatPageUrl(flatId)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Wohnung im Browser ansehen
                      <span className="material-icons">open_in_new</span>
                    </a>
                  </div>
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
