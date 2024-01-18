import { createHashHistory } from 'history';
import { MAIN } from '../constants/targets';
import type { HashHistory } from 'history';

let history: HashHistory = null;
export default function getHistory(target?: string): HashHistory {
  if (target === MAIN) {
    return null;
  }

  if (!history) {
    history = createHashHistory();
  }

  return history;
}
