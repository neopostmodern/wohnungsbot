import type { electronStateType } from "../reducers/electron";
import { electronObjects } from "../store/electronObjects";
export default function resizeViews(electronState: electronStateType, configurationVisibility: number | null | undefined = null) {
  const {
    interactiveMode
  } = electronState;
  const {
    window,
    views: {
      puppet,
      sidebar,
      botOverlay,
      configuration,
      devMenu
    }
  } = electronObjects;

  if (window === undefined || window === null) {
    // eslint-disable-next-line no-console
    console.error('Main window not defined!');
    return;
  }

  const [windowWidth, windowHeight] = window.getSize();
  const sideBarWidth = Math.min(400, Math.round(windowWidth * 0.3));
  sidebar.setBounds({
    x: 0,
    y: 0,
    width: sideBarWidth,
    height: windowHeight
  });
  puppet.setBounds({
    x: sideBarWidth + 10,
    y: 10,
    width: windowWidth - sideBarWidth,
    // - 20, // by not subtracting the offset we push the scrollbar out of view
    height: windowHeight - 20
  });
  const botOverlayHeightInManualMode = 150;
  botOverlay.setBounds({
    x: sideBarWidth,
    y: interactiveMode ? windowHeight - botOverlayHeightInManualMode : 0,
    width: windowWidth - sideBarWidth,
    height: interactiveMode ? botOverlayHeightInManualMode : windowHeight
  });
  let configurationY = electronState.configurationHidden ? windowHeight : 0;

  if (configurationVisibility !== undefined && configurationVisibility !== null) {
    configurationY = Math.round(windowHeight * (1 - configurationVisibility));
  }

  configuration.setBounds({
    x: 0,
    y: configurationY,
    width: windowWidth,
    height: windowHeight
  });

  // only exists if in dev environment
  if (devMenu) {
    devMenu.setBounds({
      x: 0,
      y: windowHeight - 30,
      width: windowWidth,
      height: 30
    });
  }
}