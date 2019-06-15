import React from 'react';
import TextField from '../inputs/TextInput';

type HiddenInputProps = {
  onChange: (value: string) => void,
  value: string
};
type HiddenInputState = {
  showHiddenInput: boolean
};

export default class HiddenInput extends React.Component<HiddenInputProps> {
  props: HiddenInputProps;

  state: HiddenInputState = { showHiddenInput: false };

  render() {
    const { onChange, value } = this.props;
    const { showHiddenInput } = this.state;
    if (showHiddenInput) {
      return (
        <TextField
          placeholder="Zugangscode"
          onChange={onChange}
          containerStyle={{ fontSize: '1rem' }}
          value={value}
          onlyChangeOnSubmit
        />
      );
    }
    return (
      <span onClick={() => this.setState({ showHiddenInput: true })}>.</span>
    );
  }
}
