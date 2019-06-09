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

export const TextField = ({
  value,
  onChange,
  placeholder,
  ...props
}: {
  value: ?string,
  onChange: (value: ?string) => void,
  placeholder: string
}) => (
  <div
    className={`textinput-wrapper ${
      !value || value.length === 0 ? 'textinput__empty' : ''
    }`}
  >
    <input
      type="text"
      value={value === null ? '' : value}
      onChange={event => onChange(event.target.value.trim())}
      placeholder={placeholder}
      {...props}
    />
    <div className="textinput-placeholder">{placeholder}</div>
  </div>
);

type EnumFieldProps = {
  value: string,
  onChange: (value: string) => void,
  options: { [key: string]: string },
  inline?: boolean,
  isWeird?: boolean
};
export const EnumField = ({
  value,
  onChange,
  options,
  inline,
  isWeird,
  ...props
}: EnumFieldProps) => (
  <div {...props}>
    {Object.entries(options).map(([optionKey, optionValue]) => (
      <div className={inline ? 'inline-enum-select' : ''}>
        <input
          type="checkbox"
          key={optionKey}
          checked={optionValue === value}
          onChange={() => onChange(optionValue)}
        />{' '}
        {optionValue}
        {isWeird ? <sup className="is-weird">&sect;</sup> : null}
      </div>
    ))}
  </div>
);
EnumField.defaultProps = {
  inline: false,
  isWeird: false
};
