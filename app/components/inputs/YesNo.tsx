import React from 'react';

type YesNoProps = {
  value: boolean | null | undefined;
  onChange: (value: boolean) => void;
};
export default class YesNo extends React.Component<YesNoProps> {
  props: YesNoProps;

  render() {
    const { value, onChange } = this.props;
    return (
      <div>
        <input type="checkbox" checked={value} onChange={onChange} /> Ja
        &nbsp;&nbsp;
        <input type="checkbox" checked={!value} onChange={onChange} /> Nein
      </div>
    );
  }
}
