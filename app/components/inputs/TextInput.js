import React from 'react';

type TextFieldProps = {
  value: ?string,
  onChange: (value: ?string) => void,
  placeholder: string,
  // eslint-disable-next-line flowtype/no-weak-types
  containerStyle?: any,
  onlyChangeOnSubmit?: boolean
};
type TextFieldState = {
  value: ?string
};

export default class TextField extends React.Component<
  TextFieldProps,
  TextFieldState
> {
  props: TextFieldProps;

  static defaultProps = {
    containerStyle: {},
    onlyChangeOnSubmit: false
  };

  state: TextFieldState;

  constructor(props: TextFieldProps) {
    super(props);

    this.state = {
      value: props.value
    };

    // eslint-disable-next-line flowtype/no-weak-types
    (this: any).handleChange = this.handleChange.bind(this);
    // eslint-disable-next-line flowtype/no-weak-types
    (this: any).handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleChange(event: SyntheticInputEvent<EventTarget>) {
    const { onChange, onlyChangeOnSubmit } = this.props;
    const { value } = event.target;

    this.setState({ value });

    if (!onlyChangeOnSubmit) {
      onChange(value.trim());
    }
  }

  handleKeyPress(event: SyntheticInputEvent<EventTarget>) {
    const { onChange } = this.props;
    if (event.key === 'Enter') {
      onChange(event.target.value.trim());
    }
  }

  render() {
    const {
      value: propsValue,
      onChange,
      placeholder,
      containerStyle,
      onlyChangeOnSubmit,
      ...props
    } = this.props;
    const { value } = this.state;

    return (
      <div
        className={`textinput-wrapper ${
          !value || value.length === 0 ? 'textinput__empty' : ''
        }`}
        style={containerStyle || {}}
      >
        <input
          type="text"
          value={value === null ? '' : value}
          onKeyPress={this.handleKeyPress}
          onChange={this.handleChange}
          placeholder={placeholder}
          {...props}
        />
        <div className="textinput-placeholder">{placeholder}</div>
      </div>
    );
  }
}
