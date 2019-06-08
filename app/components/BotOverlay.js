// @flow
import React, { Component } from 'react';
import styles from './BotOverlay.scss';
// $FlowFixMe
import BotIllustration from '../../resources/bot.svg';
import type { BrowserViewState } from '../reducers/electron';
import type { overlayStateType, anyAnimation } from '../reducers/overlay';
import type { Verdicts } from '../reducers/data';

type Props = {
  puppet: BrowserViewState,
  overlay: overlayStateType,
  verdicts: Verdicts,
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
    const { performScroll } = this.props;
    performScroll('puppet', Math.sign(event.deltaY) * 30);
  }

  render() {
    const { puppet, overlay, verdicts } = this.props;

    // $FlowFixMe (flow can't handle Object.values)
    const matchedFlats = Object.values(verdicts).filter(({ result }) => result)
      .length;

    return (
      <div
        className={styles.container}
        data-tid="container"
        onWheel={this.handleWheel}
      >
        {BotOverlay.renderAnimations(overlay.animations)}
        {overlay.overviewBoundaries
          ? overlay.overviewBoundaries.map(({ id, boundaries }) => (
              <div
                key={id}
                className={styles.verdictOverlay}
                style={{
                  top: boundaries.top,
                  left: boundaries.left,
                  width: boundaries.width,
                  height: boundaries.height
                }}
              >
                <div className={styles.summary}>
                  <span
                    className={`material-icons standalone-icon ${
                      verdicts[id].result ? styles.good : styles.bad
                    }`}
                  >
                    {verdicts[id].result ? 'thumb_up_alt' : 'thumb_down_alt'}
                  </span>
                </div>
                <div>
                  {verdicts[id].reasons.map(({ reason, result }) => (
                    <div key={reason} className={styles.reason}>
                      <div className={styles.reasonIcon}>
                        <span
                          className={`material-icons standalone-icon ${
                            result ? styles.good : styles.bad
                          }`}
                        >
                          {result ? 'check' : 'block'}
                        </span>
                      </div>
                      <div>{reason}</div>
                    </div>
                  ))}
                </div>
                <div className={styles.openInBrowser}>
                  <a
                    href={`https://www.immobilienscout24.de/expose/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Wohnung im Browser ansehen
                    <span className="material-icons">open_in_new</span>
                  </a>
                </div>
              </div>
            ))
          : null}
        <img
          src={BotIllustration}
          alt="bot"
          className={styles.botIllustration}
        />
        <div className={styles.speechBubble}>
          {puppet.ready
            ? matchedFlats > 0
              ? `${matchedFlats} passende Wohnungen gefunden.`
              : 'Ich bin bereit.'
            : `Website lädt, gleich geht's los...`}
        </div>
      </div>
    );
  }
}
