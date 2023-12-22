declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.svg';

// eslint-disable-next-line no-underscore-dangle
declare const __TARGET__: string;

// hack for https://github.com/salvoravida/redux-first-history/issues/99
// eslint-disable-next-line @typescript-eslint/no-unused-vars, import/first
import History from 'history';

declare module 'history' {
  interface History {
    goBack(): void;
    goForward(): void;
  }
}
