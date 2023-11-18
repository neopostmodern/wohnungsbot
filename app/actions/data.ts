import type {
  FlatData,
  OverviewDataEntry,
  RawFlatData,
  RawOverviewData,
  RawOverviewDataEntry,
  StringBoolean,
  Verdict
} from '../reducers/data';
import type { Action, Dispatch, ThunkAction } from '../reducers/types';
import {
  SET_OVERVIEW_DATA,
  REFRESH_VERDICTS,
  SET_VERDICT,
  SET_FLAT_DATA
} from '../constants/actionTypes';
import ElectronUtils from '../utils/electronUtils';
import electronObjects from '../store/electronObjects';
import { returnToSearchPage } from './bot';

function parseBoolean(stringBoolean: StringBoolean): boolean {
  return stringBoolean === 'true';
}

function processOverviewDataEntry(
  entry: RawOverviewDataEntry
): OverviewDataEntry {
  const realEstate = entry['resultlist.realEstate'];
  const processedEntry: OverviewDataEntry = {
    id: entry['@id'],
    title: realEstate.title,
    address: {
      postcode: realEstate.address.postcode,
      description: realEstate.address.description.text,
      neighborhood: realEstate.address.quarter.split('(')[0].trim(),
      street: realEstate.address.street
    },
    contactDetails: {
      salutation: realEstate.contactDetails.salutation,
      firstName: realEstate.contactDetails.firstname,
      lastName: realEstate.contactDetails.lastname,
      company: realEstate.contactDetails.company
    },
    rent: parseFloat(realEstate.price.value),
    area: parseFloat(realEstate.livingSpace),
    balcony: parseBoolean(realEstate.balcony),
    builtInKitchen: parseBoolean(realEstate.builtInKitchen),
    isPartOfProject: Boolean(entry.project),
    hasAlreadyApplied: Boolean(entry.alreadyApplied)
  };

  if (realEstate.address.preciseHouseNumber) {
    processedEntry.address.houseNumber = realEstate.address
      .houseNumber as any as string;
  }

  return processedEntry;
}

export function getOverviewData(): ThunkAction {
  return async (dispatch: Dispatch) => {
    const electronUtils = new ElectronUtils(
      electronObjects.views.puppet.webContents
    );

    // is null if there were zero results
    try {
      const rawOverviewData: RawOverviewData | null | undefined =
        await electronUtils.evaluate(
          `IS24['resultList']['resultListModel']['searchResponseModel']['resultlist.resultlist']['resultlistEntries'][0]['resultlistEntry']`
        );
      const data = {};

      if (rawOverviewData) {
        for (let i = 0; i < rawOverviewData.length; i++) {
          const entry = rawOverviewData[i];
          const hasApplied = await electronUtils.evaluate(
            `document.querySelector('[data-id="${entry['@id']}"]').getElementsByClassName("shortlist-star--shortlisted").length > 0`
          );
          entry.alreadyApplied = hasApplied;
          const processedEntry = processOverviewDataEntry(entry);
          data[processedEntry.id] = processedEntry;
        }
      }

      dispatch({
        type: SET_OVERVIEW_DATA,
        payload: {
          data
        }
      });
      return data;
    } catch (error) {
      dispatch(returnToSearchPage(true));
    }
  };
}

function processFlatData(flatData: RawFlatData): FlatData {
  return {
    id: flatData.obj_scoutId,
    yearConstructed: parseInt(flatData.obj_yearConstructed, 10),
    floor: parseInt(flatData.obj_floor, 10),
    rent: {
      total: parseFloat(flatData.obj_totalRent),
      base: parseFloat(flatData.obj_baseRent),
      additional: parseFloat(flatData.obj_serviceCharge)
    },
    requiresWBS: flatData.additionalData.requiresWBS
  };
}

export function getFlatData(): ThunkAction {
  return async (dispatch: Dispatch) => {
    const electronUtils = new ElectronUtils(
      electronObjects.views.puppet.webContents
    );
    const rawFlatData: RawFlatData = await electronUtils.evaluate(`utag_data`);
    rawFlatData.additionalData = {
      requiresWBS: await electronUtils.elementExists(
        '.is24qa-wohnberechtigungsschein-erforderlich-label'
      )
    };
    const flatData = processFlatData(rawFlatData);
    dispatch({
      type: SET_FLAT_DATA,
      payload: {
        flatData
      }
    });
  };
}
export function setVerdict(flatId: string, verdict: Verdict): Action {
  return {
    type: SET_VERDICT,
    payload: {
      flatId,
      verdict
    }
  };
}
export function refreshVerdicts() {
  return async (dispatch: Dispatch) => {
    dispatch({
      type: REFRESH_VERDICTS,
      payload: null
    });
  };
}
