import type {
  AdditionalFlatData,
  FlatData,
  OverviewDataEntry,
  RawFlatDataExpose,
  RawFlatDataUtag,
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
import { entrySelector } from '../constants/querySelectors';

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
        /* eslint-disable no-await-in-loop */
        for (let i = 0; i < rawOverviewData.length; i++) {
          const entry = rawOverviewData[i];
          const hasApplied = await electronUtils.evaluate(
            `document.querySelector('${entrySelector(entry['@id'])}').getElementsByClassName("shortlist-star--shortlisted").length > 0`
          );
          entry.alreadyApplied = hasApplied;
          const processedEntry = processOverviewDataEntry(entry);
          data[processedEntry.id] = processedEntry;
        }
        /* eslint-enable no-await-in-loop */
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
      return null;
    }
  };
}

function processFlatData(
  flatDataUtag: RawFlatDataUtag,
  flatDataExpose: RawFlatDataExpose,
  additionalFlatData: AdditionalFlatData
): FlatData {
  return {
    id: flatDataUtag.obj_scoutId,
    yearConstructed: parseInt(flatDataUtag.obj_yearConstructed, 10),
    floor: parseInt(flatDataUtag.obj_floor, 10),
    rent: {
      total: parseFloat(flatDataUtag.obj_totalRent),
      base: parseFloat(flatDataUtag.obj_baseRent),
      additional: parseFloat(flatDataUtag.obj_serviceCharge)
    },
    applicationLinksExternally: Boolean(
      flatDataExpose.contactData.contactButton.clickOutUrl
    ),
    requiresWBS: additionalFlatData.requiresWBS
  };
}

export function getFlatData(): ThunkAction {
  return async (dispatch: Dispatch) => {
    const electronUtils = new ElectronUtils(
      electronObjects.views.puppet.webContents
    );
    const rawFlatDataUtag: RawFlatDataUtag =
      await electronUtils.evaluate(`utag_data`);
    const rawFlatDataExpose: RawFlatDataExpose = await electronUtils.evaluate(
      `JSON.parse(JSON.stringify(IS24.expose))`
    );
    const additionalData = {
      requiresWBS: await electronUtils.elementExists(
        '.is24qa-wohnberechtigungsschein-erforderlich-label'
      )
    };
    console.log(rawFlatDataExpose);
    const flatData = processFlatData(
      rawFlatDataUtag,
      rawFlatDataExpose,
      additionalData
    );
    console.log(flatData);
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
