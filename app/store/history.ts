import { createHashHistory } from 'history';
import { MAIN } from '../constants/targets';

let history: History = null;
export default function getHistory(target: string): History {
  if (target === MAIN) {
    return null;
  }

  if (!history) {
    history = createHashHistory();
  }

  return history;
}
