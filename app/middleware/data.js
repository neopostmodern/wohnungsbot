// @flow

import type { Action, Dispatch, Store } from '../reducers/types';
import { DATA_OVERVIEW_SET, REFRESH_VERDICTS } from '../constants/actionTypes';
import type { OverviewDataEntry, Verdict } from '../reducers/data';
import { refreshVerdicts, setVerdict } from '../actions/data';
import type { configurationStateType } from '../reducers/configuration';

function assessFlatFromOverviewEntry(
  entry: OverviewDataEntry,
  configuration: configurationStateType
): Verdict {
  const reasons = [];
  const flatPostcode = entry.address.postcode;
  reasons.push({
    reason: `Postleitzahl: ${flatPostcode}`,
    result: configuration.postcodes.includes(flatPostcode)
  });

  if (
    entry.title.includes('WBS') ||
    entry.title.toLowerCase().includes('wohnberechtigung')
  ) {
    reasons.push({
      reason: `Wohnberechtigungsschein erforderlich`,
      result: configuration.hasWBS
    });
  }

  // todo: send mail
  if (
    entry.title.toLowerCase().includes('bes.') ||
    entry.title.toLowerCase().includes('besichtigung')
  ) {
    reasons.push({
      reason: `Besichtigungstermin im Titel`,
      result: false
    });
  }

  if (configuration.mustHaveBalcony) {
    reasons.push({
      reason: `Balkon / Terasse`,
      result: entry.balcony
    });
  }

  if (configuration.mustHaveKitchenette) {
    reasons.push({
      reason: `${entry.builtInKitchen ? '' : 'Keine '}Einbauküche`,
      result: entry.builtInKitchen
    });
  }

  if (configuration.noKitchenette) {
    reasons.push({
      reason: `${entry.builtInKitchen ? '' : 'Keine '}Einbauküche`,
      result: !entry.builtInKitchen
    });
  }

  const result = reasons.every(reason => reason.result);

  return {
    result,
    reasons
  };
}

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => (action: Action) => {
  if (action.type === DATA_OVERVIEW_SET) {
    process.nextTick(() => store.dispatch(refreshVerdicts()));
  }

  if (action.type === REFRESH_VERDICTS) {
    const {
      data: { overview },
      configuration
    } = store.getState();

    if (overview) {
      overview.forEach(entry => {
        const verdict = assessFlatFromOverviewEntry(entry, configuration);
        store.dispatch(setVerdict(entry.id, verdict));
      });
    }
  }

  next(action);
};
