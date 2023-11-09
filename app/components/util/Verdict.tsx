import React from 'react';
import styles from './Verdict.scss';
import { flatPageUrl } from '../../flat/urlBuilder';
import type { Verdict } from '../../reducers/data';
type VerdictProps = {
  flatId: string;
  verdict: Verdict;
  isAlreadyApplied: boolean;
  isUnsuitable: boolean;
};

const VerdictSummary = ({
  verdict,
  isAlreadyApplied,
  isUnsuitable
}: {
  verdict: Verdict;
  isAlreadyApplied: boolean;
  isUnsuitable: boolean;
}) => {
  if (isAlreadyApplied) {
    return <div className={styles.oneLineReason}>Bewerbung abgeschickt</div>;
  }

  if (isUnsuitable) {
    return <div className={styles.oneLineReason}>Unpassend</div>;
  }

  return (
    <>
      {verdict.reasons.map(({ reason, result }) => (
        <div key={reason} className={styles.reason}>
          <div className={styles.reasonIcon}>
            <span
              className={`material-icons standalone-icon ${
                result ? 'good' : 'bad'
              }`}
            >
              {result ? 'check' : 'block'}
            </span>
          </div>
          <div>{reason}</div>
        </div>
      ))}
    </>
  );
};

export default class VerdictComponent extends React.Component<VerdictProps> {
  getMainIcon(): string {
    const { verdict, isAlreadyApplied, isUnsuitable } = this.props;

    if (isAlreadyApplied) {
      return 'done_outline';
    }

    if (isUnsuitable) {
      return 'block';
    }

    return verdict.result ? 'thumb_up_alt' : 'thumb_down_alt';
  }

  render() {
    const { verdict, isAlreadyApplied, isUnsuitable, flatId } = this.props;
    return (
      <div className={styles.verdictOverlay}>
        {verdict ? (
          <>
            <div className={styles.summary}>
              <span
                className={`material-icons standalone-icon ${
                  !isUnsuitable && (verdict.result || isAlreadyApplied)
                    ? 'good'
                    : 'bad'
                }`}
              >
                {this.getMainIcon()}
              </span>
            </div>
            <div>
              <VerdictSummary
                verdict={verdict}
                isAlreadyApplied={isAlreadyApplied}
                isUnsuitable={isUnsuitable}
              />
            </div>
          </>
        ) : (
          <i>Keine Informationen</i>
        )}
        <div className={styles.openInBrowser}>
          <a
            href={flatPageUrl(flatId)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Wohnung im Browser ansehen
            <span className="material-icons">open_in_new</span>
          </a>
        </div>
      </div>
    );
  }
}
