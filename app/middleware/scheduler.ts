import type { Action, Dispatch, Store } from '../reducers/types';
import { LAUNCH_NEXT_TASK } from '../constants/actionTypes';
import { navigateToFlatPage, noop, returnToSearchPage } from '../actions/bot';
import type { schedulerStateType } from '../reducers/scheduler';
import { endApplicationProcess } from '../actions/application';

export default (store: Store & { dispatch: Dispatch }) =>
  (next: Dispatch) =>
  async (action: Action) => {
    const {
      scheduler
    }: {
      scheduler: schedulerStateType;
    } = store.getState();

    if (action.type === LAUNCH_NEXT_TASK) {
      if (scheduler.isActive === true) {
        // eslint-disable-next-line no-console
        console.error('Attempt to launch a second task, ignored.');
        return next(noop());
      }

      if (scheduler.queuedFlatIds.length === 0) {
        setTimeout(
          () => {
            store.dispatch(returnToSearchPage(true));
          },
          60000 + Math.random() * 300000
        );
        return next(noop());
      }

      const nextFlatId = scheduler.queuedFlatIds[0];
      const result = next(action);
      const reachedFlatPage = await store.dispatch(
        navigateToFlatPage(nextFlatId)
      );

      if (!reachedFlatPage) {
        // eslint-disable-next-line no-console
        console.error(`Flat page wasn't reached, aborting task.`);
        store.dispatch(endApplicationProcess());
      }

      return result;
    }

    return next(action);
  };
