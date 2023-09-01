import React, { Component } from "react";
import styles from "./DevMenu.scss";
import type { BrowserViewName, Views } from "../reducers/electron";
type DevMenuProps = {
  views: Views;
  showDevTools: (name: BrowserViewName) => void;
  resetConfiguration: () => void;
  resetCache: () => void;
  logout: () => void;
};
type DevMenuState = {
  expanded: boolean;
};
export default class DevMenu extends Component<DevMenuProps, DevMenuState> {
  props: DevMenuProps;
  state: DevMenuState = {
    expanded: false
  };

  render() {
    const {
      views,
      showDevTools,
      resetConfiguration,
      resetCache,
      stopBot,
      logout
    } = this.props;
    const {
      expanded
    } = this.state;
    return <div className={`${styles.container} ${expanded ? '' : styles.collapsed}`}>
        <div className={styles.menu}>
          {Object.keys(views).map(viewName => <div key={viewName} className={styles.menuItem}>
              <div className={styles.entryName}>{viewName}</div>
              <button type="button" onClick={() => showDevTools(viewName)}>
                <span className="material-icons">build</span>{' '}
                <span className="material-icons">open_in_new</span>
              </button>
            </div>)}

          <div className={styles.menuItem} style={{
          marginLeft: 'auto'
        }}>
            <button type="button" onClick={resetCache}>
              Reset cache <span className="material-icons">replay</span>
            </button>
          </div>
          <div className={styles.menuItem}>
            <button type="button" onClick={resetConfiguration}>
              Reset <span className="material-icons">replay</span>
            </button>
          </div>
          <div className={styles.menuItem}>
            <button type="button" onClick={logout}>
              Logout <span className="material-icons">replay</span>
            </button>
          </div>
          <div className={styles.menuItem}>
            <button type="button" onClick={stopBot}>
              Stop <span className="material-icons">stop</span>
            </button>
          </div>
          <div className={styles.menuItem} id={styles.visibilityToggle}>
            <button type="button" onClick={() => this.setState(prevState => ({
            expanded: !prevState.expanded
          }))}>
              <span className="material-icons">
                {expanded ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
          </div>
        </div>
      </div>;
  }

}