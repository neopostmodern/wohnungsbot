// credit: https://github.com/danro/jquery-easing/blob/master/jquery.easing.js#L38

/* eslint-disable */
export const easeInOutCubic = (
  currentTime,
  startValue,
  valueChange,
  duration
) => {
  if ((currentTime /= duration / 2) < 1)
    return (
      (valueChange / 2) * currentTime * currentTime * currentTime + startValue
    );
  return (
    (valueChange / 2) * ((currentTime -= 2) * currentTime * currentTime + 2) +
    startValue
  );
};
/* eslint-enable */
