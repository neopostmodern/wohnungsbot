// @flow

export const entrySelector = (entryId: string): string =>
  `[data-id="${entryId}"]`;
export const entryTitleSelector = (entryId: string): string =>
  `.result-list-entry__data a[data-exp-id="${entryId}"] > h2`;
