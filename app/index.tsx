import React from 'react';
import { render } from "react-dom";
import { RENDERER } from "./constants/targets";
import Root from "./containers/Root";
import getHistory from "./store/history";
import "./styles/app.global.scss";
// eslint-disable-next-line no-undef
const target = typeof __TARGET__ === 'undefined' ? RENDERER : __TARGET__;
import('./store/configureStore').then(({
  default: configureStore
}) => configureStore(target, process.env.NODE_ENV === 'development')).then(store => {
  const history = getHistory();
  render(
    <Root store={store} history={history} />,
    document.getElementById('root')
  );

  if (module.hot) {
    module.hot.accept('./containers/Root', () => {
      // eslint-disable-next-line global-require
      const NextRoot = require('./containers/Root').default;

      render(
        <NextRoot store={store} history={history} />,
        document.getElementById('root')
      );
    });
  }
}).catch(error => {
  // eslint-disable-next-line no-console
  console.error(`Error in index.tsx`, error);
});