// @flow
import React, { Component } from 'react';
import styles from './Sidebar.scss';
import type { ApplicationData } from '../reducers/cache';
import { flatPageUrl } from '../flat/urlBuilder';

type Props = {
  showConfiguration: () => void,
  returnToSearchPage: () => void,
  applications: Array<ApplicationData>
};
type State = {
  announcement?: string
};

export default class Sidebar extends Component<Props, State> {
  props: Props;

  state: State = {};

  async componentWillMount() {
    const response = await fetch(
      'https://wohnung.neopostmodern.com/announcement.html'
    );
    const announcement = await response.text();

    this.setState({ announcement });
  }

  render() {
    const { showConfiguration, returnToSearchPage, applications } = this.props;
    const { announcement } = this.state;

    return (
      <div className={styles.container}>
        <h3>Letzte Bewerbungen</h3>
        {applications.map(({ flatId, success, reason, addressDescription }) => (
          <div key={flatId} className={styles.entry}>
            <div className={styles.symbol}>
              <span
                className={`material-icons standalone-icon ${
                  success ? styles.good : 'bad'
                }`}
              >
                {success ? 'check' : 'clear'}
              </span>
            </div>
            <div>
              <div>{addressDescription.split('(')[0]}</div>
              <div>
                {success ? (
                  <a
                    href={flatPageUrl(flatId)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Wohnung im Browser ansehen
                    <span className="material-icons">open_in_new</span>
                  </a>
                ) : (
                  reason
                )}
              </div>
            </div>
          </div>
        ))}
        <div
          id={styles.announcement}
          dangerouslySetInnerHTML={{ __html: announcement || '' }}
        />
        <button onClick={showConfiguration} type="button">
          <span className="material-icons">arrow_backward</span>
          Suchfilter anpassen
        </button>
        <br />
        <br />
        <button onClick={returnToSearchPage} type="button">
          <span className="material-icons">replay</span> Bot zurücksetzen
        </button>
        <div className={styles.comment}>
          Zurücksetzen hilft eventuell, wenn der Bot nicht mehr funktioniert.
          Wenn das Zurücksetzen nicht hilft, versuche die App zu schließen und
          erneut zu öffnen.
          <br />
          Deine Daten bleiben erhalten!
        </div>
      </div>
    );
  }
}
