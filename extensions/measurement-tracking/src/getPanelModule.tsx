import { Types } from '@ohif/core';
import { PanelMeasurementTableTracking, PanelStudyBrowserTracking } from './panels';
import React from 'react';

// TODO:
// - No loading UI exists yet
// - cancel promises when component is destroyed
// - show errors in UI for thumbnails if promise fails

function getPanelModule({ commandsManager, extensionManager, servicesManager }): Types.Panel[] {
  return [
    {
      name: 'seriesList',
      iconName: 'tab-studies',
      iconLabel: 'SidePanel:Studies',
      label: 'SidePanel:Studies',
      component: props => <PanelStudyBrowserTracking {...props} />,
    },
    {
      name: 'trackedMeasurements',
      iconName: 'tab-linear',
      iconLabel: 'SidePanel:Measure',
      label: 'SidePanel:Measurements',
      component: props => (
        <PanelMeasurementTableTracking
          {...props}
          key="trackedMeasurements-panel"
          commandsManager={commandsManager}
          extensionManager={extensionManager}
          servicesManager={servicesManager}
        />
      ),
    },
  ];
}

export default getPanelModule;
