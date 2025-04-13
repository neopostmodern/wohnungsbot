import React from 'react';
import { createRoot } from 'react-dom/client';
import { RENDERER } from './constants/targets';
import Root from './containers/Root';
import getHistory from './store/history';
import './styles/app.global.scss';

import('./store/configureStore')
  .then(({ default: configureStore }) => {
    return configureStore(RENDERER, process.env.NODE_ENV === 'development');
  })
  /* eslint-disable promise/always-return */
  .then((store) => {
    const history = getHistory();
    const reactRoot = createRoot(document.getElementById('root'));
    reactRoot.render(<Root store={store} history={history} />);

    if (module.hot) {
      module.hot.accept('./containers/Root', () => {
        // eslint-disable-next-line global-require
        const NextRoot = require('./containers/Root').default;

        reactRoot.render(<NextRoot store={store} history={history} />);
      });
    }
  })
  /* eslint-enable promise/always-return */
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(`Error in index.tsx`, error);
  });
