// @flow
import React, { Component } from 'react';
import styles from './Sidebar.scss';
import type { ApplicationData, BaseCacheEntry } from '../reducers/cache';
import { homepage, version, bugs } from '../../package.json';
import RecentApplication from './sidebar/recentApplication';

type Props = {
  showConfiguration: () => void,
  openPDF: (pdfPath: string) => void,
  resetBot: () => void,
  applications: Array<ApplicationData & BaseCacheEntry>
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
    const { showConfiguration, resetBot, applications, openPDF } = this.props;
    const { announcement } = this.state;

    return (
      <div className={styles.container}>
        <button onClick={showConfiguration} type="button" className={styles.adjustFiltersButton}>
          <span className="material-icons">arrow_backward</span>
          Suchfilter anpassen
        </button>
        <div
          id={styles.announcement}
          dangerouslySetInnerHTML={{ __html: announcement || '' }}
        />
        <h3>Letzte Bewerbungen</h3>
        <div className={styles.recentApplications}>
          {applications.map(application => (
            <RecentApplication
              key={application.flatId}
              application={application}
              openPDF={() => openPDF(application.pdfPath)}
            />
          ))}
        </div>

        <button onClick={resetBot} type="button" className={styles.resetButton}>
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
