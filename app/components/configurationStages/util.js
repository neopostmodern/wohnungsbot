import React from 'react';

const valueToInt = (value: string) => {
  const parsedValue = parseFloat(value);

  if (Number.isNaN(parsedValue)) {
    return null;
  }

  return parsedValue;
};
export const NumberField = ({
  value,
  onChange,
  ...props
}: {
  value: ?number,
  onChange: (value: ?number) => void
}) => (
  <input
    type="number"
    value={value === null ? '' : value}
    onChange={event => onChange(valueToInt(event.target.value))}
    {...props}
  />
);
