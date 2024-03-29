import { LOGIN, LOGOUT } from '../constants/actionTypes';
import type { Action, Dispatch, Store } from '../reducers/types';
import { sleep, timeout } from '../utils/async';
import {
  performAutomaticLogin,
  performManualLogin
} from '../utils/performLogin';
import { electronRouting } from '../actions/electron';
import { abortable } from '../utils/generators';
import AbortionSystem, { ABORTION_ERROR } from '../utils/abortionSystem';
import ElectronUtilsRedux from '../utils/electronUtilsRedux';
import { LoginStatus, UseAccount } from '../reducers/configuration';
import { setBotIsActing, setLoginStatus } from '../actions/bot';
import performLogout from '../utils/performLogout';
import electronObjects from '../store/electronObjects';

export default (store: Store & { dispatch: Dispatch }) =>
  (next: (action: Action) => void) =>
  async (action: Action) => {
    if (action.type === LOGIN || action.type === LOGOUT) {
      const {
        configuration: {
          immobilienScout24: { useAccount }
        }
      } = store.getState();
      await store.dispatch(setBotIsActing(false));
      await store.dispatch(
        electronRouting('puppet', 'https://www.immobilienscout24.de/')
      );
      await sleep(4000);
      const { webContents } = electronObjects.views.puppet;
      const electronUtils = new ElectronUtilsRedux(webContents, store.dispatch);

      if (action.type === LOGOUT || useAccount === UseAccount.NEIN) {
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
          console.error(`Error during logout: ${error}`);
          AbortionSystem.abort(ABORTION_ERROR);
          await store.dispatch(setLoginStatus(LoginStatus.ERROR));
        }
      } else if (useAccount === UseAccount.JA) {
        const { abortableAction: abortablePerformAutomaticLogin, abort } =
          abortable(performAutomaticLogin);
        AbortionSystem.registerAbort(abort);

        try {
          await timeout(
            abortablePerformAutomaticLogin(
              store.dispatch,
              electronUtils,
              store.getState().configuration
            ),
            300000
          );
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Error during login: ${error}`);
          AbortionSystem.abort(ABORTION_ERROR);
          await store.dispatch(setLoginStatus(LoginStatus.ERROR));
        }
      } else if (useAccount === UseAccount.MANUELL) {
        const { abortableAction: abortablePerformManualLogin, abort } =
          abortable(performManualLogin);
        AbortionSystem.registerAbort(abort);

        try {
          await timeout(
            abortablePerformManualLogin(
              store.dispatch,
              electronUtils,
              store.getState().configuration
            ),
            300000
          );
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Error during login: ${error}`);
          AbortionSystem.abort(ABORTION_ERROR);
          await store.dispatch(setLoginStatus(LoginStatus.ERROR));
        }
      }

      await sleep(2000);
    }

    return next(action);
  };
