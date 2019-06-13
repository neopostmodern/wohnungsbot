import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import ConfigurationPage from './containers/ConfigurationPage';
import SidebarPage from './containers/SidebarPage';
import BotOverlayPage from './containers/BotOverlayPage';
import DevMenuPage from './containers/DevMenuPage';
import PlaceholderPage from './containers/PlaceholderPage';

export default () => (
  <App>
    <Switch>
      <Route path={routes.SIDEBAR} component={SidebarPage} />
      <Route path={routes.BOT_OVERLAY} component={BotOverlayPage} />
      <Route path={routes.CONFIGURATION} component={ConfigurationPage} />
      <Route path={routes.DEV_MENU} component={DevMenuPage} />
      <Route path={routes.PLACEHOLDER} component={PlaceholderPage} />
    </Switch>
  </App>
);
