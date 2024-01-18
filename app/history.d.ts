// hack for https://github.com/salvoravida/redux-first-history/issues/99
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import History from 'history';

declare module 'history' {
  interface History {
    goBack(): void;
    goForward(): void;
  }
}

