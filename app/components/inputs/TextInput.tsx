import React from 'react';
import CSS from 'csstype';

type TextFieldProps = {
  type?: string;
  value: string | null | undefined;
  onChange: (value: string | null | undefined) => void;
  placeholder: string;
  style: CSS.Properties;
  containerStyle?: CSS.Properties;
  onlyChangeOnSubmit?: boolean;
  error?: boolean;
  required?: boolean;
};
type TextFieldState = {
  value: string | null | undefined;
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
    (this as any).handleChange = this.handleChange.bind(this);
    (this as any).handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { onChange, onlyChangeOnSubmit } = this.props;
    const { value } = event.target as HTMLInputElement;
    this.setState({
      value
    });

    if (!onlyChangeOnSubmit) {
      onChange(value.trim());
    }
  }

  handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    const { onChange } = this.props;

    if (event.key === 'Enter') {
      onChange((event.target as HTMLInputElement).value.trim());
    }
  }

  render() {
    const { type, placeholder, containerStyle, style, required, error } =
      this.props;
    const { value } = this.state;
    const hasError = error || (required && !value);
    return (
      <div
        className={`textinput-wrapper ${
          !value || value.length === 0 ? 'textinput__empty' : ''
        } ${hasError ? 'textinput__error' : ''}`}
        style={containerStyle || {}}
      >
        <input
          type={type || 'text'}
          value={value === null ? '' : value}
          onKeyPress={this.handleKeyPress}
          onChange={this.handleChange}
          placeholder={placeholder}
          style={style}
        />
        <div className="textinput-placeholder">{placeholder}</div>
      </div>
    );
  }
}
