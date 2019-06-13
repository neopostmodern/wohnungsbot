import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { RENDERER } from './constants/targets';
import Root from './containers/Root';
import getHistory from './store/history';
import './styles/app.global.scss';

// eslint-disable-next-line no-undef
const target = typeof __TARGET__ === 'undefined' ? RENDERER : __TARGET__;

import('./store/configureStore')
  .then(({ default: configureStore }) =>
    configureStore(target, process.env.NODE_ENV === 'development')
  )
  .then(store => {
    const history = getHistory();

    const AppContainer = process.env.PLAIN_HMR
      ? Fragment
      : ReactHotAppContainer;

    render(
      <AppContainer>
        <Root store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );

    if (module.hot) {
      module.hot.accept('./containers/Root', () => {
        // eslint-disable-next-line global-require
        const NextRoot = require('./containers/Root').default;
        render(
          <AppContainer>
            <NextRoot store={store} history={history} />
          </AppContainer>,
          document.getElementById('root')
        );
      });
    }
  })
  .catch(error => console.error(error));
