import { utils } from '@ohif/core';
import i18n from '@ohif/i18n';
const { formatDate } = utils;

export default {
  'studyBrowser.studyMenuItems': [],
  'studyBrowser.thumbnailMenuItems': [
    {
      id: 'tagBrowser',
      label: 'StudyBrowser:Tag Browser',
      iconName: 'DicomTagBrowser',
      commands: 'openDICOMTagViewer',
    },
    {
      id: 'addAsLayer',
      label: 'StudyBrowser:Add as Layer',
      iconName: 'ViewportViews',
      commands: 'addDisplaySetAsLayer',
    },
  ],
  'studyBrowser.sortFunctions': [
    {
      label: 'StudyBrowser:Series Number',
      sortFunction: (a, b) => {
        return a?.SeriesNumber - b?.SeriesNumber;
      },
    },
    {
      label: 'StudyBrowser:Series Date',
      sortFunction: (a, b) => {
        const dateA = new Date(formatDate(a?.SeriesDate));
        const dateB = new Date(formatDate(b?.SeriesDate));
        return dateB.getTime() - dateA.getTime();
      },
    },
  ],
  'studyBrowser.viewPresets': [
    {
      id: 'list',
      iconName: 'ListView',
      selected: false,
    },
    {
      id: 'thumbnails',
      iconName: 'ThumbnailView',
      selected: true,
    },
  ],
  'studyBrowser.studyMode': 'all',
  'studyBrowser.thumbnailDoubleClickCallback': {
    callbacks: [
      ({ activeViewportId, servicesManager, commandsManager, isHangingProtocolLayout }) =>
        async displaySetInstanceUID => {
          const { hangingProtocolService, uiNotificationService } = servicesManager.services;
          let updatedViewports = [];
          const viewportId = activeViewportId;

          // No active viewport (e.g. the hanging protocol has not been applied
          // yet or nothing matched the study) - dispatching a viewport update
          // without a viewportId would throw inside the grid reducer and crash
          // the app.
          if (!viewportId) {
            uiNotificationService.show({
              title: i18n.t('StudyBrowser:Thumbnail Double Click'),
              message: i18n.t(
                'StudyBrowser:There is no active viewport to display the selected series.'
              ),
              type: 'info',
              duration: 3000,
            });
            return;
          }

          try {
            updatedViewports = hangingProtocolService.getViewportsRequireUpdate(
              viewportId,
              displaySetInstanceUID,
              isHangingProtocolLayout
            );
          } catch (error) {
            console.warn(error);
            uiNotificationService.show({
              title: i18n.t('StudyBrowser:Thumbnail Double Click'),
              message: i18n.t(
                'StudyBrowser:The selected display sets could not be added to the viewport.'
              ),
              type: 'error',
              duration: 3000,
            });
          }

          commandsManager.run('setDisplaySetsForViewports', {
            viewportsToUpdate: updatedViewports,
          });
        },
    ],
  },
};
