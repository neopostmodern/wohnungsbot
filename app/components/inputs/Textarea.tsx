import React from "react";
type TextareaProps = {
  value: string | null | undefined;
  onChange: (value: string | null | undefined) => void;
};
type TextareaState = {
  value: string | null | undefined;
};
export default class Textarea extends React.Component<TextareaProps, TextareaState> {
  props: TextareaProps;
  state: TextareaState;

  constructor(props: TextareaProps) {
    super(props);
    this.state = {
      value: props.value
    };
    // eslint-disable-next-line flowtype/no-weak-types
    (this as any).handleChange = this.handleChange.bind(this);
  }

  handleChange(event: React.SyntheticEvent<EventTarget>) {
    const {
      onChange
    } = this.props;
    const {
      value
    } = event.target;
    this.setState({
      value
    });
    onChange(value);
  }

  render() {
    const {
      value
    } = this.state;
    return <textarea value={value} onChange={this.handleChange} />;
  }

}