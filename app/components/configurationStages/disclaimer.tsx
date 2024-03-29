import React from 'react';
import styles from '../Configuration.scss';

function Disclaimer() {
  return (
    <div className={styles.disclaimer}>
      &sect; Diese Einordnung wird im Formular der Online-Wohnungssuche benutzt.
      Der Bot lehnt diese Kategorien ab.
    </div>
  );
}

export default Disclaimer;
