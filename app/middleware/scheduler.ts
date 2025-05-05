import type { Action, Dispatch, Store } from '../reducers/types';
import { LAUNCH_NEXT_TASK } from '../constants/actionTypes';
import {
  navigateToFlatPage,
  noop,
  returnToSearchPage,
  popFlatFromQueue
} from '../actions/bot';
import { markCompleted } from '../actions/cache';
import type { schedulerStateType } from '../reducers/scheduler';
import { CacheNames } from '../reducers/cache';
import type { dataStateType } from '../reducers/data';
import { endApplicationProcess } from '../actions/application';
import { logger } from '../utils/tracer-logger.js';

export default (store: Store & { dispatch: Dispatch }) =>
  (next: Dispatch) =>
  async (action: Action) => {
    const {
      data: { overview, flat, verdicts },
      scheduler
    }: {
      data: dataStateType;
      scheduler: schedulerStateType;
    } = store.getState();

    if (action.type === LAUNCH_NEXT_TASK) {
      if (scheduler.isActive === true) {
        logger.error('Attempt to launch a second task, ignored.');
        return next(noop());
      }

      if (scheduler.queuedFlatIds.length === 0) {
        // this is the seach-loop: if no investigation is scheduled, after a delay, we reload the (same) search page, which eventually will trigger launchNextTask
        // try to be non-botty and wait between 1 and 6 minutes
        const delay = 60_000 + Math.random() * 300_000;
        setTimeout(() => {
          store.dispatch(returnToSearchPage(true));
        }, delay);
        logger.trace(
          `No investigation scheduled. Reload search page in ${delay / 1000}s`
        );
        return next(noop());
      }

      const result = next(action);

      const nextFlatId = scheduler.queuedFlatIds[0];
      logger.debug(`Queue:${scheduler.queuedFlatIds}`);
      logger.info(`Next Task: Wohnung ${nextFlatId} genauer anschauen...`);
      if (!Object.keys(overview).includes(nextFlatId)) {
        logger.warn('Current flat is not in overview!');
      }
      const reachedFlatPage = await store.dispatch(
        navigateToFlatPage(nextFlatId)
      );

      if (!reachedFlatPage) {
        // eslint-disable-next-line no-console
        logger.error(`Flat page wasn't reached, aborting task.`);
        await store.dispatch(popFlatFromQueue(nextFlatId));
        await store.dispatch(
          markCompleted(CacheNames.APPLICATIONS, nextFlatId, {
            flatId: nextFlatId,
            success: false,
            addressDescription: '',
            reason: 'Flat not found'
          })
        );
        store.dispatch(endApplicationProcess());
      }

      return result;
    }

    return next(action);
  };
