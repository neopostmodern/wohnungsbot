import React from 'react';
import styles from './Placeholder.scss';
import BotIllustrationActive from '../../resources/bot-active.svg';

function Placeholder() {
  return (
    <div className={styles.container}>
      <img src={BotIllustrationActive} alt="bot" />
      <h1>Wohnungsbot</h1>
    </div>
  );
}

export default Placeholder;
