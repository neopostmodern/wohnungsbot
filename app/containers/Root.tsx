import React, { Component } from "react";
import { Provider } from "react-redux";
import { HistoryRouter as Router } from "redux-first-history/rr6"; // https://github.com/remix-run/react-router/pull/7586

import type { Store } from "../reducers/types";
import Routes from "../Routes";
type Props = {
  store: Store;
  history: {};
};
export default class Root extends Component<Props> {
  render() {
    const {
      store,
      history
    } = this.props;
    return <Provider store={store}>
        <Router history={history}>
          <Routes />
        </Router>
      </Provider>;
  }

}