// @flow

import {
  pullWebConfiguration,
  setConfiguration,
  setSearchUrl
} from '../actions/configuration';
import { refreshVerdicts } from '../actions/data';
import type { Action, Dispatch, Store } from '../reducers/types';
import {
  PULL_WEB_CONFIGURATION,
  PUSH_WEB_CONFIGURATION,
  SET_SEARCH_URL,
  SET_STRING
} from '../constants/actionTypes';
import { getConfigurationFilterHash } from '../reducers/configuration';
import { generateSearchUrl } from '../flat/urlBuilder';
import { hideConfiguration } from '../actions/electron';
import { WAKE_UP } from '../actions/infrastructure';
import { setBotMessage } from '../actions/bot';
import { loadConfiguration, submitConfiguration } from '../utils/networking';
import { resetCache } from '../actions/cache';

// eslint-disable-next-line no-unused-vars
export default (store: Store) => (next: Dispatch) => async (action: Action) => {
  if (action.type === WAKE_UP) {
    // allow the configuration to be loaded from persistence, i.e. the exhibitionIdentifier
    const result = next(action);
    if (store.getState().configuration.exhibitionIdentifier) {
      await store.dispatch(pullWebConfiguration(true));
    }
    return result;
  }

  if (
    action.type === SET_STRING &&
    action.payload.name === 'exhibitionIdentifier'
  ) {
    store.dispatch(pullWebConfiguration());
  }

  if (action.type === PULL_WEB_CONFIGURATION) {
    const { isWakeUp } = action.payload;
    const { configuration } = store.getState();
    const { exhibitionIdentifier } = configuration;
    try {
      const webConfiguration = await loadConfiguration(exhibitionIdentifier);
      if (
        isWakeUp ||
        (getConfigurationFilterHash(webConfiguration) !==
          getConfigurationFilterHash(configuration) ||
          webConfiguration.contactData.firstName !==
            configuration.contactData.firstName)
      ) {
        const patchedConfiguration = Object.assign({}, webConfiguration, {
          exhibitionIdentifier
        });
        store.dispatch(setBotMessage('Neuer Suchfilter geladen!', 60000));
        store.dispatch(setConfiguration(patchedConfiguration));
        if (!isWakeUp) {
          store.dispatch(resetCache());
        }
        store.dispatch(hideConfiguration());
      }
    } catch (error) {
      console.error(error);
      setTimeout(() => store.dispatch(pullWebConfiguration(isWakeUp)), 60000);
    }
  }

  if (action.type === PUSH_WEB_CONFIGURATION) {
    await submitConfiguration(store.getState().configuration);
  }

  if (!action.meta || !action.meta.configuration) {
    return next(action);
  }

  const filterBeforeUpdate = getConfigurationFilterHash(
    store.getState().configuration
  );

  const result = next(action);

  if (
    getConfigurationFilterHash(store.getState().configuration) !==
    filterBeforeUpdate
  ) {
    store.dispatch(refreshVerdicts());

    if (action.type !== SET_SEARCH_URL) {
      process.nextTick(() => {
        store.dispatch(
          setSearchUrl(generateSearchUrl(store.getState().configuration))
        );
      });
    }
  }

  return result;
};
