declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.svg';

// eslint-disable-next-line no-underscore-dangle
declare const __TARGET__: string;
