export const floorToName = (floor: number, limit?: number) => {
  if (floor === 0) {
    return 'Erdgeschoss';
  }

  let floorName = `${floor}. Stock`;
  if (floor === limit) {
    floorName += ' und höher';
  }
  return floorName;
};

export const numberToGermanFloatString = (value: ?number): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return value.toFixed(2).replace('.', ',');
};
