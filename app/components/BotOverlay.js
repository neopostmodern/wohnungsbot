// @flow
import React, { Component } from 'react';
import styles from './BotOverlay.scss';
import BotIllustration from '../../resources/bot.svg';
import type { BrowserViewState } from '../reducers/electron';
import type { animationsStateType, anyAnimation } from '../reducers/animations';

type Props = {
  puppet: BrowserViewState,
  animations: animationsStateType
};

export default class BotOverlay extends Component<Props> {
  props: Props;

  renderAnimations(animations: Array<anyAnimation>) {
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

  render() {
    const { puppet, animations } = this.props;

    return (
      <div className={styles.container} data-tid="container">
        {this.renderAnimations(animations.animations)}
        <img
          src={BotIllustration}
          alt="bot"
          className={styles.botIllustration}
        />
        <div className={styles.speechBubble}>
          {puppet.ready
            ? 'Ich bin bereit.'
            : `Website lädt, gleich geht's los...`}
        </div>
      </div>
    );
  }
}
