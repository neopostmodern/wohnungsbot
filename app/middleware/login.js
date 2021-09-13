// @flow

import { LOGIN, LOGOUT } from '../constants/actionTypes';
import type { Action, Store } from '../reducers/types';
import { sleep, timeout } from '../utils/async';
import performLogin from '../utils/performLogin';
import { electronRouting } from '../actions/electron';
import { abortable } from '../utils/generators';
import AbortionSystem, { ABORTION_ERROR } from '../utils/abortionSystem';
import ElectronUtilsRedux from '../utils/electronUtilsRedux';
import { LOGINSTATUS } from '../reducers/configuration';
import { setBotIsActing, setLoginStatus } from '../actions/bot';
import performLogout from '../utils/performLogout';

export default (store: Store) =>
  (next: (action: Action) => void) =>
  async (action: Action) => {
    try {
      if (action.type === LOGIN) {
        const { configuration, electron } = store.getState();
        const {
          immobilienScout24: { userName, password, status }
        } = configuration;
        const shouldTryToLogin =
          status !== LOGINSTATUS.LOGGED_IN &&
          userName !== '' &&
          password !== '';

        if (shouldTryToLogin) {
          await store.dispatch(setBotIsActing(false));
          await store.dispatch(
            electronRouting('puppet', 'https://www.immobilienscout24.de/')
          );
          await sleep(4000);
          const { webContents } = electron.views.puppet.browserView;
          const electronUtils = new ElectronUtilsRedux(
            webContents,
            store.dispatch
          );
          const { abortableAction: abortablePerformLogin, abort } =
            abortable(performLogin);
          AbortionSystem.registerAbort(abort);
          try {
            await timeout(
              abortablePerformLogin(
                store.dispatch,
                electronUtils,
                store.getState().configuration
              ),
              300000
            );
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Error in application: ${error}`);
            AbortionSystem.abort(ABORTION_ERROR);
            await store.dispatch(setLoginStatus(LOGINSTATUS.ERROR));
          }
          await sleep(2000);
        }
      } else if (action.type === LOGOUT) {
        const { electron } = store.getState();

        await store.dispatch(setBotIsActing(false));
        await store.dispatch(
          electronRouting('puppet', 'https://www.immobilienscout24.de/')
        );
        await sleep(4000);
        const { webContents } = electron.views.puppet.browserView;
        const electronUtils = new ElectronUtilsRedux(
          webContents,
          store.dispatch
        );
        const { abortableAction: abortablePerformLogout, abort } =
          abortable(performLogout);
        AbortionSystem.registerAbort(abort);
        try {
          await timeout(
            abortablePerformLogout(
              store.dispatch,
              electronUtils,
              store.getState().configuration
            ),
            300000
          );
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Error in application: ${error}`);
          AbortionSystem.abort(ABORTION_ERROR);
          await store.dispatch(setLoginStatus(LOGINSTATUS.ERROR));
        }
        await sleep(2000);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Login error: ${error}`);
      await sleep(5000);
      await store.dispatch(setLoginStatus(LOGINSTATUS.ERROR));
    }

    return next(action);
  };
