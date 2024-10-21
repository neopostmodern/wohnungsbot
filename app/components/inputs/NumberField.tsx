import React from 'react';
import CSS from 'csstype';

const valueToInt = (value: string) => {
  const parsedValue = parseFloat(value);

  if (Number.isNaN(parsedValue)) {
    return null;
  }

  return parsedValue;
};

function NumberField({
  value,
  onChange,
  step,
  style
}: {
  value: number | null | undefined;
  onChange: (value: number | null | undefined) => void;
  step?: number;
  style?: CSS.Properties;
}) {
  return (
    <input
      type="number"
      value={value === null ? '' : value}
      onChange={(event) => onChange(valueToInt(event.target.value))}
      step={step}
      style={style}
    />
  );
}

NumberField.defaultProps = {
  step: undefined,
  style: {}
};
export default NumberField;
