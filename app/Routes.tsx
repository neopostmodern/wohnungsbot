import React from "react";
import { Routes, Route } from "react-router-dom";
import routes from "./constants/routes";
import App from "./containers/App";
import ConfigurationPage from "./containers/ConfigurationPage";
import SidebarPage from "./containers/SidebarPage";
import BotOverlayPage from "./containers/BotOverlayPage";
import DevMenuPage from "./containers/DevMenuPage";
import PlaceholderPage from "./containers/PlaceholderPage";
export default (() => <App>
    <Routes>
      <Route path={routes.SIDEBAR} element={<SidebarPage />} />
      <Route path={routes.BOT_OVERLAY} element={<BotOverlayPage />} />
      <Route path={routes.CONFIGURATION} element={<ConfigurationPage />} />
      <Route path={routes.DEV_MENU} element={<DevMenuPage />} />
      <Route path={routes.PLACEHOLDER} element={<PlaceholderPage />} />
    </Routes>
  </App>);