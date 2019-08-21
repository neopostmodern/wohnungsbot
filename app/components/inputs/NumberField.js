import React from 'react';

const valueToInt = (value: string) => {
  const parsedValue = parseFloat(value);

  if (Number.isNaN(parsedValue)) {
    return null;
  }

  return parsedValue;
};
const NumberField = ({
  value,
  onChange,
  step,
  style
}: {
  value: ?number,
  onChange: (value: ?number) => void,
  step?: number,
  style?: CSSStyleDeclaration
}) => (
  <input
    type="number"
    value={value === null ? '' : value}
    onChange={event => onChange(valueToInt(event.target.value))}
    step={step}
    style={style}
  />
);
NumberField.defaultProps = {
  step: undefined,
  style: {}
};

export default NumberField;
