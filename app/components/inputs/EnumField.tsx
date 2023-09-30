import React from "react";
type EnumFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  inline?: boolean;
  isWeird?: boolean;
};

const EnumField = ({
  value,
  onChange,
  options,
  inline,
  isWeird
}: EnumFieldProps) => <div>
    {Object.entries(options).map(([optionKey, optionValue]: any) => <div className={inline ? 'inline-enum-select' : ''} key={optionKey}>
        <input type="checkbox" checked={optionValue === value} onChange={() => onChange(optionValue)} />{' '}
        {optionValue}
        {isWeird ? <sup className="is-weird">&sect;</sup> : null}
      </div>)}
  </div>;

EnumField.defaultProps = {
  inline: false,
  isWeird: false
};
export default EnumField;