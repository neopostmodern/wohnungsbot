// @flow
import React, { Component } from 'react';
import styles from './DevMenu.scss';
import type { BrowserViewName, Views } from '../reducers/electron';

type Props = {
  views: Views,
  showDevTools: (name: BrowserViewName) => void,
  resetConfiguration: () => void,
  resetCache: () => void
};

export default class BotOverlay extends Component<Props> {
  props: Props;

  render() {
    const { views, showDevTools, resetConfiguration, resetCache } = this.props;

    return (
      <div className={styles.container}>
        <div className={styles.menu}>
          {Object.keys(views).map(viewName => (
            <div key={viewName} className={styles.menuItem}>
              <div className={styles.entryName}>{viewName}</div>
              <button type="button" onClick={() => showDevTools(viewName)}>
                DevTools <span className="material-icons">open_in_new</span>
              </button>
            </div>
          ))}

          <div className={styles.menuItem} style={{ marginLeft: 'auto' }}>
            <button type="button" onClick={resetCache}>
              Reset cache <span className="material-icons">replay</span>
            </button>
          </div>
          <div className={styles.menuItem}>
            <button type="button" onClick={resetConfiguration}>
              Reset configuration <span className="material-icons">replay</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
