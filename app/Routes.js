import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import ConfigurationPage from './containers/ConfigurationPage';
import SidebarPage from './containers/SidebarPage';
import BotOverlayPage from './containers/BotOverlayPage';

export default () => (
  <App>
    <Switch>
      <Route path={routes.SIDEBAR} component={SidebarPage} />
      <Route path={routes.BOT_OVERLAY} component={BotOverlayPage} />
      <Route path={routes.CONFIGURATION} component={ConfigurationPage} />
    </Switch>
  </App>
);
