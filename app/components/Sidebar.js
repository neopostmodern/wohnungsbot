// @flow
import React, { Component } from 'react';
import styles from './Sidebar.scss';
import type { ApplicationData } from '../reducers/cache';
import { flatPageUrl } from '../flat/urlBuilder';
import { homepage, version, bugs } from '../../package.json';

type Props = {
  showConfiguration: () => void,
  openPDF: (pdfPath: string) => void,
  returnToSearchPage: () => void,
  applications: Array<ApplicationData>
};
type State = {
  announcement?: string
};

export default class Sidebar extends Component<Props, State> {
  props: Props;

  static RecentApplicationsShowCount = 7;

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
        {applications
          .slice(0, Sidebar.RecentApplicationsShowCount)
          .map(({ flatId, success, reason, addressDescription, pdfPath }) => (
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
              <div className={styles.entryText}>
                <div>{addressDescription.split('(')[0]}</div>
                <div>
                  {success ? (
                    <a
                      href={flatPageUrl(flatId)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Wohnung ansehen
                      <span className="material-icons">open_in_new</span>
                    </a>
                  ) : (
                    reason
                  )}
                </div>
              </div>
              <div className={`${styles.symbol} ${styles.clickable}`}>
                {pdfPath ? (
                  <span
                    className="material-icons standalone-icon"
                    onClick={this.props.openPDF.bind(this, pdfPath)}
                  >
                    picture_as_pdf
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        {applications.length > Sidebar.RecentApplicationsShowCount ? (
          <div>
            und {applications.length - Sidebar.RecentApplicationsShowCount}{' '}
            vorherige
          </div>
        ) : null}

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
        <div className={styles.softwareInformation}>
          <div>
            <a href={homepage} target="_blank" rel="noopener noreferrer">
              Wohnungsbot {version}
            </a>
          </div>
          <div>
            <a href={bugs.url} target="_blank" rel="noopener noreferrer">
              Problem melden <span className="material-icons">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    );
  }
}
