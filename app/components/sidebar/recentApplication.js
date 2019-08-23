import React from 'react';
import type { ApplicationData, BaseCacheEntry } from '../../reducers/cache';
import styles from '../Sidebar.scss';
import { flatPageUrl } from '../../flat/urlBuilder';

const RecentApplication = ({
  application: {
    flatId,
    success,
    reason,
    addressDescription,
    pdfPath,
    timestamp
  },
  openPDF
}: {
  application: ApplicationData & BaseCacheEntry,
  openPDF: () => void
}) => {
  const addressParts = addressDescription.split('(')[0].split(',');
  const area = addressParts.slice(-1).pop();
  const street =
    addressParts.length > 1 ? (
      addressParts[0]
    ) : (
      <div className={styles.unknownStreet}>Straße nicht angegeben</div>
    );

  return (
    <div className={`${styles.entry} ${success ? '' : styles.failure}`}>
      <div className={styles.entryHeader}>
        <div>{area}</div>
        <div>{new Date(timestamp).toLocaleString('de').split(',')[0]}</div>
      </div>
      <div className={styles.entryBody}>
        <div className={styles.entryMainText}>
          {street}
          <div>{success ? null : reason}</div>
        </div>
        <div className={`${styles.symbol} ${styles.clickable}`}>
          {pdfPath ? (
            <span
              className="material-icons"
              onClick={openPDF}
              title="Wohnung ansehen (PDF, immer verfügbar)"
            >
              picture_as_pdf
            </span>
          ) : null}
        </div>
        <div className={`${styles.symbol}`}>
          <a
            href={flatPageUrl(flatId)}
            target="_blank"
            rel="noopener noreferrer"
            title="Wohnung ansehen (im Browser, falls noch online)"
          >
            <span className="material-icons">open_in_new</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default RecentApplication;
