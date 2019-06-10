import React from 'react';

type EnumFieldProps = {
  value: string,
  onChange: (value: string) => void,
  options: { [key: string]: string },
  inline?: boolean,
  isWeird?: boolean
};

const EnumField = ({
  value,
  onChange,
  options,
  inline,
  isWeird,
  ...props
}: EnumFieldProps) => (
  <div {...props}>
    {/* eslint-disable-next-line flowtype/no-weak-types */}
    {Object.entries(options).map(([optionKey, optionValue]: any) => (
      <div className={inline ? 'inline-enum-select' : ''} key={optionKey}>
        <input
          type="checkbox"
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

export default EnumField;
