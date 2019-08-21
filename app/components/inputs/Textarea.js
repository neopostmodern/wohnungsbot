// @flow

import React from 'react';

type TextareaProps = {
  value: ?string,
  onChange: (value: ?string) => void
};
type TextareaState = {
  value: ?string
};

export default class Textarea extends React.Component<
  TextareaProps,
  TextareaState
> {
  props: TextareaProps;

  state: TextareaState;

  constructor(props: TextareaProps) {
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

    onChange(value);
  }

  render() {
    const { value } = this.state;

    return <textarea value={value} onChange={this.handleChange} />;
  }
}
