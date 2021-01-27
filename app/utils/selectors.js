// @flow

export const entrySelector = (entryId: string) => `[data-id="${entryId}"]`;
export const entryTitleSelector = (entryId: string) =>
  `${entrySelector(entryId)} .result-list-entry__brand-title`;
