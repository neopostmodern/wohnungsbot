import React from 'react';

type TextFieldProps = {
  value: ?string,
  onChange: (value: ?string) => void,
  placeholder: string
};
type TextFieldState = {
  value: ?string
};

export default class TextField extends React.Component<
  TextFieldProps,
  TextFieldState
> {
  props: TextFieldProps;

  state: TextFieldState;

  constructor(props: TextFieldProps) {
    super(props);

    this.state = {
      value: props.value
    };

    // eslint-disable-next-line flowtype/no-weak-types
    (this: any).handleChange = this.handleChange.bind(this);
  }

  handleChange(event: SyntheticInputEvent<EventTarget>) {
    const { onChange } = this.props;
    const { value } = event.target;

    this.setState({ value });

    onChange(value.trim());
  }

  render() {
    const { value: propsValue, onChange, placeholder, ...props } = this.props;
    const { value } = this.state;

    return (
      <div
        className={`textinput-wrapper ${
          !value || value.length === 0 ? 'textinput__empty' : ''
        }`}
      >
        <input
          type="text"
          value={value === null ? '' : value}
          onChange={this.handleChange}
          placeholder={placeholder}
          {...props}
        />
        <div className="textinput-placeholder">{placeholder}</div>
      </div>
    );
  }
}
