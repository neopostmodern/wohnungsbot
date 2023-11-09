// eslint-disable-next-line import/prefer-default-export
export function objectHash(object) {
  const jsonString = object ? JSON.stringify(object) : '';
  let hash = 0;
  let i;
  let chr;
  if (jsonString.length === 0) return hash;

  // eslint-disable-next-line no-plusplus
  for (i = 0; i < jsonString.length; i++) {
    chr = jsonString.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + chr;
    // eslint-disable-next-line no-bitwise
    hash |= 0; // Convert to 32bit integer
  }

  return hash;
}
