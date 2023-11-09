import * as React from 'react';

type Props = {
  children: React.ReactNode;
};
export default class App extends React.Component<Props> {
  props: Props;

  render() {
    const { children } = this.props;
    return <>{children}</>;
  }
}
