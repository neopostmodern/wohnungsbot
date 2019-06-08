// @flow

import type { Action, Dispatch, Store } from '../reducers/types';
import {
  SET_OVERVIEW_DATA,
  REFRESH_VERDICTS,
  SET_FLAT_DATA
} from '../constants/actionTypes';
import {
  FLAT_ACTION,
  type FlatAction,
  type OverviewDataEntry,
  type Verdict
} from '../reducers/data';
import { refreshVerdicts, setVerdict } from '../actions/data';
import type { configurationStateType } from '../reducers/configuration';
import { navigateToFlatPage } from '../actions/electron';
import type { FlatData } from '../reducers/data';

function assessFlatFromOverviewEntry(
  entry: OverviewDataEntry,
  configuration: configurationStateType
): Verdict {
  let action: FlatAction = FLAT_ACTION.IGNORE;

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

  if (
    entry.title.toLowerCase().includes('bes.') ||
    entry.title.toLowerCase().includes('besichtigung')
  ) {
    reasons.push({
      reason: `Besichtigungstermin im Titel`,
      result: false
    });
    action = FLAT_ACTION.NOTIFY_VIEWING_DATE;
  }

  // todo: check for 'öbliert'

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

  if (result) {
    action = FLAT_ACTION.INVESTIGATE;
  }

  return {
    result,
    reasons,
    action
  };
}

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => async (action: Action) => {
  if (action.type === SET_OVERVIEW_DATA || action.type === SET_FLAT_DATA) {
    process.nextTick(() => store.dispatch(refreshVerdicts()));
  }

  if (action.type === REFRESH_VERDICTS) {
    const {
      data: { overview, flat },
      configuration
    } = store.getState();

    if (overview) {
      // eslint-disable-next-line no-restricted-syntax
      for (const entry of overview) {
        const verdict = assessFlatFromOverviewEntry(entry, configuration);

        store.dispatch(setVerdict(entry.id, verdict));

        if (verdict.action === FLAT_ACTION.NOTIFY_VIEWING_DATE) {
          // todo: send mail
        }

        if (verdict.action === FLAT_ACTION.INVESTIGATE) {
          store.dispatch(navigateToFlatPage(entry.id));
        }
      }
    }

    // $FlowFixMe -- Object.values, again.
    Object.values(flat).forEach((flatData: FlatData) => {
      // todo: check flat and apply
    });
  }

  return next(action);
};
