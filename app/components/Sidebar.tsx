import React, { Component } from "react";
import styles from "./Sidebar.scss";
import type { ApplicationData, BaseCacheEntry } from "../reducers/cache";
import packageJson from "../../package.json";
import RecentApplication from "./sidebar/recentApplication";
import { LOADING, UP_TO_DATE } from "../constants/updater";

const { homepage, version, bugs } = packageJson;

type Props = {
  showConfiguration: () => void;
  openPDF: (pdfPath: string) => void;
  resetBot: () => void;
  applications: Array<ApplicationData & BaseCacheEntry>;
  availableVersion: string;
  downloadProgressPercentage: number;
};
type State = {
  announcement?: string;
};
export default class Sidebar extends Component<Props, State> {
  props: Props;
  state: State = {};

  async componentWillMount() {
    try {
      const response = await fetch('https://wohnungsbot.de/announcement.html');
      const announcement = await response.text();

      this.setState({ announcement });
    } catch (error) {
      this.setState({
        announcement: `Neuigkeiten zum Wohnungsbot konnten leider nicht geladen werden.<br/><small>Technische Fehlermeldung:<pre>${error.toString()}</pre></small>`
      });
    }
  }

  render() {
    const {
      showConfiguration,
      resetBot,
      applications,
      openPDF,
      availableVersion,
      downloadProgressPercentage
    } = this.props;
    const {
      announcement
    } = this.state;
    let updateNotification = null;

    if (availableVersion === LOADING) {
      updateNotification = 'Suche nach Updates...';
    } else if (availableVersion !== UP_TO_DATE) {
      if (downloadProgressPercentage < 0) {
        updateNotification = <>
            Der <b>Wohnungsbot {availableVersion}</b> ist verfügbar, aber das
            Update kann auf macOS nicht automatisch installiert werden. Bitte{' '}
            <a href={homepage + '#downloads'} target="_blank" rel="noopener noreferrer">
              lade die neuste Version manuell herunter
            </a>{' '}
            und installiere sie.
          </>;
      } else if (downloadProgressPercentage >= 100) {
        updateNotification = <>
            Der <b>Wohnungsbot {availableVersion}</b> wurde heruntergeladen und
            wird beim nächsten Start installiert.
          </>;
      } else {
        updateNotification = <>
            Der <b>Wohnungsbot {availableVersion}</b> ist verfügbar und wird
            gerade heruntergeladen ({downloadProgressPercentage.toFixed(0)}%).
          </>;
      }
    }

    return <div className={styles.container}>
        <button onClick={showConfiguration} type="button" className={styles.adjustFiltersButton}>
          <span className="material-icons">arrow_backward</span>
          Suchfilter anpassen
        </button>
        <div id={styles.announcement} dangerouslySetInnerHTML={{
        __html: announcement || ''
      }} />
        <h3>Letzte Bewerbungen</h3>
        <div className={styles.recentApplications}>
          {applications.map(application => <RecentApplication key={application.flatId} application={application} openPDF={() => openPDF(application.pdfPath)} />)}
        </div>

        <div className={styles.spacer} />
        <button onClick={resetBot} type="button">
          <span className="material-icons">replay</span> Bot zurücksetzen
        </button>
        <div className={styles.comment}>
          Zurücksetzen hilft eventuell, wenn der Bot nicht mehr funktioniert.
          Wenn das Zurücksetzen nicht hilft, versuche die App zu schließen und
          erneut zu öffnen.
          <br />
          Deine Daten bleiben erhalten!
        </div>
        {updateNotification && <div className={styles.updateNotification}>{updateNotification}</div>}
        <div className={styles.softwareInformation}>
          <div>
            <a href={homepage} target="_blank" rel="noopener noreferrer">
              Wohnungsbot {version}
              {availableVersion === UP_TO_DATE ? <span className="material-icons" title="Aktuelle Version">
                  done
                </span> : <span className="material-icons" title={availableVersion === LOADING ? 'Suche nach Updates' : `Aktuellere Version verfügbar: ${availableVersion}`}>
                  update
                </span>}
            </a>
          </div>
          <div>
            <a href={bugs.url} target="_blank" rel="noopener noreferrer">
              Problem melden <span className="material-icons">open_in_new</span>
            </a>
          </div>
        </div>
      </div>;
  }

}
