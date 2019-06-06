// @flow
import React, { Component } from 'react';
import styles from './Sidebar.css';
import type { BrowserViewState } from '../reducers/electron';
import type { dataStateType } from '../reducers/data';

type Props = {
  clickLogin: () => void,
  showConfiguration: () => void,
  returnToSearchPage: () => void,
  puppet: BrowserViewState,
  // eslint-disable-next-line react/no-unused-prop-types
  data: dataStateType
};

export default class Sidebar extends Component<Props> {
  props: Props;

  renderContent() {
    const { clickLogin, showConfiguration, returnToSearchPage } = this.props;

    return (
      <>
        <button onClick={clickLogin} type="button">
          Login
        </button>
        <br />
        <br />
        <br />
        <button onClick={showConfiguration} type="button">
          Suchfilter anpassen
        </button>
        <br />
        <br />
        <button onClick={returnToSearchPage} type="button">
          Seite erneut laden
        </button>
      </>
    );
  }

  render() {
    const { puppet } = this.props;

    return (
      <div className={styles.container}>
        {puppet && puppet.ready ? this.renderContent() : <i>Loading...</i>}
      </div>
    );
  }
}
