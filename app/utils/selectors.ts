export const entrySelector = (entryId: string): string =>
  `[data-id="${entryId}"]`;
export const entryTitleSelector = (entryId: string): string =>
  `[data-exp-id="${entryId}"] > h2`;
