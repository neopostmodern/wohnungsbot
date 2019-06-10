import type { configurationStateType } from '../reducers/configuration';
import { getConfigurationHash } from '../reducers/configuration';
import type {
  FlatAction,
  FlatData,
  OverviewDataEntry,
  Verdict
} from '../reducers/data';
import { FLAT_ACTION, VERDICT_SCOPE } from '../reducers/data';
import { floorToName } from '../utils/germanStrings';

// eslint-disable-next-line import/prefer-default-export
export function assessFlat(
  configuration: configurationStateType,
  overviewDataEntry: OverviewDataEntry,
  flatData?: FlatData
): Verdict {
  let action: FlatAction = FLAT_ACTION.IGNORE;

  const reasons = [];
  const flatPostcode = overviewDataEntry.address.postcode;
  reasons.push({
    reason: `Postleitzahl: ${flatPostcode}`,
    result: configuration.postcodes.includes(flatPostcode)
  });

  if (
    overviewDataEntry.title.includes('WBS') ||
    overviewDataEntry.title.toLowerCase().includes('wohnberechtigung')
  ) {
    reasons.push({
      reason: `Wohnberechtigungsschein erforderlich`,
      result: configuration.hasWBS
    });
  }

  if (
    overviewDataEntry.title.toLowerCase().includes('bes.') ||
    overviewDataEntry.title.toLowerCase().includes('besichtigung')
  ) {
    reasons.push({
      reason: `Besichtigungstermin im Titel`,
      result: false
    });
    action = FLAT_ACTION.NOTIFY_VIEWING_DATE;
  }

  if (configuration.onlyUnfurnished) {
    reasons.push({
      reason: `Unmöbliert`,
      result: !overviewDataEntry.title.toLowerCase().includes('öbliert')
    });
  }

  if (configuration.mustHaveBalcony) {
    reasons.push({
      reason: `Balkon / Terasse`,
      result: overviewDataEntry.balcony
    });
  }

  if (configuration.mustHaveKitchenette) {
    reasons.push({
      reason: `${overviewDataEntry.builtInKitchen ? '' : 'Keine '}Einbauküche`,
      result: overviewDataEntry.builtInKitchen
    });
  }

  if (configuration.noKitchenette) {
    reasons.push({
      reason: `${overviewDataEntry.builtInKitchen ? '' : 'Keine '}Einbauküche`,
      result: !overviewDataEntry.builtInKitchen
    });
  }

  if (flatData) {
    const normalizedFloor = Math.min(4, flatData.floor);

    reasons.push({
      reason: floorToName(flatData.floor),
      result: configuration.floors.includes(normalizedFloor)
    });

    if (flatData.requiresWBS) {
      reasons.push({
        reason: `Wohnberechtigungsschein erforderlich`,
        result: configuration.hasWBS
      });
    }

    if (configuration.onlyOldBuilding) {
      reasons.push({
        reason: `Altbau`,
        result: flatData.yearConstructed < 1950
      });
    }
  }

  const result = reasons.every(reason => reason.result);
  let scope;

  if (flatData) {
    scope = VERDICT_SCOPE.COMPLETE;

    if (result) {
      action = FLAT_ACTION.APPLY;
    } else {
      action = FLAT_ACTION.DISCARD;
    }
  } else {
    scope = VERDICT_SCOPE.OVERVIEW;

    if (result) {
      action = FLAT_ACTION.INVESTIGATE;
    }
  }

  return {
    configurationHash: getConfigurationHash(configuration),
    scope,
    result,
    reasons,
    action
  };
}
