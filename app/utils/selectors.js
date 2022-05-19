// @flow

export const entrySelector = (entryId: string): string =>
  `[data-id="${entryId}"]`;
export const entryTitleSelector = (entryId: string): string =>
  `${entrySelector(entryId)} .result-list-entry__brand-title`;
