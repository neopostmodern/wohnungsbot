import React from 'react';
import { render } from 'react-dom';
import { RENDERER } from './constants/targets';
import Root from './containers/Root';
import getHistory from './store/history';
import './styles/app.global.scss';

const isDevelopment = process.env.NODE_ENV === 'development';
const enableDebug = process.env.ENABLE_DEBUG === 'true';

import('./store/configureStore')
  .then(({ default: configureStore }) => {
    return configureStore(RENDERER, isDevelopment);
  })
  /* eslint-disable promise/always-return */
  .then((store) => {
    const history = getHistory();
    if (module.hot) {
      module.hot.accept('./containers/Root', () => {
        // eslint-disable-next-line global-require
        const NextRoot = require('./containers/Root').default;
        render(
          <NextRoot store={store} history={history} />,
          document.getElementById('root')
        );
      });
    } else {
      render(
        <Root store={store} history={history} />,
        document.getElementById('root')
      );
    }
  })
  /* eslint-enable promise/always-return */
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(`Error in index.tsx`, error);
  });
