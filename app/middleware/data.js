// @flow

import type { Action, Dispatch, Store } from '../reducers/types';
import { DATA_OVERVIEW_SET, REFRESH_VERDICTS } from '../constants/actionTypes';
import type { RawOverviewDataEntry, Verdict } from '../reducers/data';
import { refreshVerdicts, setVerdict } from '../actions/data';
import type { configurationStateType } from '../reducers/configuration';

function assessFlatFromOverviewEntry(
  rawEntry: RawOverviewDataEntry,
  configuration: configurationStateType
): Verdict {
  const reasons = [];
  const flatPostcode = rawEntry['resultlist.realEstate'].address.postcode;
  reasons.push({
    reason: `Postleitzahl: ${flatPostcode}`,
    result: configuration.zipCodes.includes(flatPostcode)
  });

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

    overview.forEach(rawEntry => {
      const flatId = rawEntry['@id'];

      const verdict = assessFlatFromOverviewEntry(rawEntry, configuration);
      store.dispatch(setVerdict(flatId, verdict));
    });
  }

  next(action);
};
