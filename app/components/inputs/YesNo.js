import React from 'react';

type YesNoProps = {
  value: ?boolean,
  onChange: (value: boolean) => void
};

export default class YesNo extends React.Component<YesNoProps> {
  props: YesNoProps;

  render() {
    const { value, onChange, ...props } = this.props;

    return (
      <div {...props}>
        <input type="checkbox" checked={value} onChange={onChange} /> Ja
        &nbsp;&nbsp;
        <input type="checkbox" checked={!value} onChange={onChange} /> Nein
      </div>
    );
  }
}
