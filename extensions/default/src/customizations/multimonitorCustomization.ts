export default {
  'studyBrowser.studyMenuItems': {
    $push: [
      {
        id: 'applyHangingProtocol',
        label: 'StudyBrowser:Apply Hanging Protocol',
        iconName: 'ViewportViews',
        items: [
          {
            id: 'applyDefaultProtocol',
            label: 'StudyBrowser:Default',
            commands: [
              'loadStudy',
              {
                commandName: 'setHangingProtocol',
                commandOptions: {
                  protocolId: 'default',
                },
              },
            ],
          },
          {
            id: 'applyMPRProtocol',
            label: 'StudyBrowser:2x2 Grid',
            commands: [
              'loadStudy',
              {
                commandName: 'setHangingProtocol',
                commandOptions: {
                  protocolId: '@ohif/mnGrid',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'showInOtherMonitor',
        label: 'StudyBrowser:Launch On Second Monitor',
        iconName: 'DicomTagBrowser',
        selector: ({ servicesManager }) => {
          const { multiMonitorService } = servicesManager.services;
          return multiMonitorService.isMultimonitor;
        },
        commands: {
          commandName: 'multimonitor',
          commandOptions: {
            hashParams: '&hangingProtocolId=@ohif/mnGrid8',
            commands: [
              'loadStudy',
              {
                commandName: 'setHangingProtocol',
                commandOptions: {
                  protocolId: '@ohif/mnGrid8',
                },
              },
            ],
          },
        },
      },
    ],
  },
};
