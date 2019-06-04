// @flow
import React, { Component } from 'react';
import styles from './Sidebar.css';
import type { BrowserViewState } from '../reducers/electron';
import type { dataStateType } from '../reducers/data';

type Props = {
  clickLogin: () => void,
  electronRouting: (name: 'puppet', url: string) => void,
  puppet: BrowserViewState,
  data: dataStateType
};

export default class Sidebar extends Component<Props> {
  props: Props;

  renderContent() {
    const { clickLogin, electronRouting, data } = this.props;

    return (
      <>
        <button
          onClick={() =>
            electronRouting(
              'puppet',
              'https://www.immobilienscout24.de/Suche/S-2/Wohnung-Miete/Berlin/Berlin/69_17_34_46_48_81_54_61_67_79_73/1,00-3,00/-/EURO--1350,00'
            )
          }
          type="button"
        >
          Start
        </button>
        <br />
        <br />
        <button onClick={clickLogin} type="button">
          Login
        </button>
        <br />
        <br />
        <br />
        <button
          onClick={() =>
            electronRouting(
              'puppet',
              'https://www.immobilienscout24.de/Suche/S-2/Wohnung-Miete/Berlin/Berlin/69_17_34_46_48_81_54_61_67_79_73/1,00-3,00/-/EURO--1350,00'
            )
          }
          type="button"
        >
          Reset
        </button>
        <br />
        <br />
        <br />
        <br />
        {data && data.overview ? (
          <pre
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(data.overview, null, 2)
            }}
          />
        ) : null}
      </>
    );
  }

  render() {
    const {
      puppet
    } = this.props;

    return (
      <div className={styles.container}>
        {puppet && puppet.ready ? this.renderContent() : <i>Loading...</i>}
      </div>
    );
  }
}
