import type { Configuration } from '../reducers/configuration';
import { getConfigurationFilterHash } from '../reducers/configuration';
import type {
  FlatData,
  OverviewDataEntry,
  Verdict
} from '../reducers/data';
import { FLAT_ACTION, VERDICT_SCOPE } from '../reducers/data';
import { floorToName } from '../utils/germanStrings';
// eslint-disable-next-line import/prefer-default-export
export function assessFlat(
  configuration: Configuration,
  overviewDataEntry: OverviewDataEntry,
  flatData?: FlatData
): Verdict {
  let action: FLAT_ACTION = FLAT_ACTION.IGNORE;
  const reasons = [];

  if (overviewDataEntry.hasAlreadyApplied) {
    reasons.push({
      reason: 'Bereits beworben',
      result: false
    });
  }

  if (overviewDataEntry.isPartOfProject) {
    reasons.push({
      reason: 'Projekt',
      result: false
    });
  }

  if (overviewDataEntry.rent / overviewDataEntry.area < 4) {
    reasons.push({
      reason: 'Angebot ist fake',
      result: false
    });
  }

  const flatPostcode = overviewDataEntry.address.postcode;
  reasons.push({
    reason: `Postleitzahl: ${flatPostcode}`,
    result: configuration.filter.postcodes.includes(flatPostcode)
  });

  if (
    overviewDataEntry.title.includes('WBS') ||
    overviewDataEntry.title.toLowerCase().includes('wohnberechtigung')
  ) {
    reasons.push({
      reason: `Wohnberechtigungsschein erforderlich`,
      result: configuration.filter.hasWBS
    });
  }

  if (configuration.filter.maximumRentPerSquareMeter) {
    const rentPerSquareMeter = overviewDataEntry.rent / overviewDataEntry.area;
    reasons.push({
      reason: `${rentPerSquareMeter.toFixed(2)} €/m² (kalt)`,
      result:
        rentPerSquareMeter < configuration.filter.maximumRentPerSquareMeter
    });
  }

  if (
    overviewDataEntry.title.toLowerCase().includes('bes.') ||
    overviewDataEntry.title.toLowerCase().includes('bes:') ||
    overviewDataEntry.title.toLowerCase().includes('besichtigung') ||
    overviewDataEntry.title.includes('Visit')
  ) {
    reasons.push({
      reason: `Besichtigungstermin im Titel`,
      result: false
    });
    action = FLAT_ACTION.NOTIFY_VIEWING_DATE;
  }

  if (configuration.filter.onlyUnfurnished) {
    reasons.push({
      reason: `Unmöbliert`,
      result: !(
        overviewDataEntry.title.toLowerCase().includes('öbliert') ||
        overviewDataEntry.title.toLowerCase().includes('öbelisier') ||
        overviewDataEntry.title.toLowerCase().includes('furnish') ||
        overviewDataEntry.title.toLowerCase().includes('furniture') ||
        overviewDataEntry.title.toLowerCase().includes('equipped')
      )
    });
  }

  if (configuration.filter.mustHaveBalcony) {
    reasons.push({
      reason: `Balkon / Terasse`,
      result: overviewDataEntry.balcony
    });
  }

  if (configuration.filter.mustHaveKitchenette) {
    reasons.push({
      reason: `${overviewDataEntry.builtInKitchen ? '' : 'Keine '}Einbauküche`,
      result: overviewDataEntry.builtInKitchen
    });
  }

  if (configuration.filter.noKitchenette) {
    reasons.push({
      reason: `${overviewDataEntry.builtInKitchen ? '' : 'Keine '}Einbauküche`,
      result: !overviewDataEntry.builtInKitchen
    });
  }

  if (configuration.filter.noSwapApartment) {
    reasons.push({
      reason: `Keine Tauschwohnung`,
      result: !(
        overviewDataEntry.title.toLowerCase().includes('tausch') ||
        overviewDataEntry.title.toLowerCase().includes('swap')
      )
    });
  }

  if (configuration.filter.notSpecificallyForSeniors) {
    reasons.push({
      reason: `Keine Senioren-Wohnung`,
      result: !(
        overviewDataEntry.title.toLowerCase().includes('senioren') ||
        overviewDataEntry.title.toLowerCase().includes('altersgerechtes')
      )
    });
  }

  const subleaseCond =
    overviewDataEntry.title.toLowerCase().includes('zwischenmiete') ||
    overviewDataEntry.title.toLowerCase().includes('befr.') ||
    overviewDataEntry.title.toLowerCase().includes('befristet') ||
    overviewDataEntry.title.toLowerCase().includes(' bis ');

  if (configuration.filter.onlySublease) {
    reasons.push({
      reason: `Zwischenmiete`,
      result: subleaseCond
    });
  }

  if (configuration.filter.noSublease) {
    reasons.push({
      reason: `Keine Zwischenmiete`,
      result: !subleaseCond
    });
  }

  if (flatData) {
    if (!Number.isNaN(flatData.floor)) {
      const normalizedFloor = Math.min(4, flatData.floor);
      reasons.push({
        reason: floorToName(flatData.floor),
        result: configuration.filter.floors.includes(normalizedFloor)
      });
    }

    if (flatData.requiresWBS) {
      reasons.push({
        reason: `Wohnberechtigungsschein erforderlich`,
        result: configuration.filter.hasWBS
      });
    }

    if (configuration.filter.onlyOldBuilding) {
      reasons.push({
        reason: `Altbau`,
        result: flatData.yearConstructed < 1950
      });
    }
  }

  const result = reasons.every((reason) => reason.result);
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
    flatId: overviewDataEntry.id,
    configurationHash: getConfigurationFilterHash(configuration),
    scope,
    result,
    reasons,
    action
  };
}
