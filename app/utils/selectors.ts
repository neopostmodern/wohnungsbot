export const entrySelector = (entryId: string): string => `[data-id="${entryId}"]`;
export const entryTitleSelector = (entryId: string): string => `[data-go-to-expose-id="${entryId}"] > h2`;