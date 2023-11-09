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
