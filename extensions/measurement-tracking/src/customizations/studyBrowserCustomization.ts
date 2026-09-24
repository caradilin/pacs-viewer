import { measurementTrackingMode } from '../contexts/TrackedMeasurementsContext/promptBeginTracking';
import i18n from '@ohif/i18n';

type CheckHasDirtyAndSimplifiedModeProps = {
  servicesManager: AppTypes.ServicesManager;
  appConfig: AppTypes.Config;
  displaySetInstanceUID: string;
};

const onDoubleClickHandler = {
  callbacks: [
    ({ activeViewportId, servicesManager, isHangingProtocolLayout, appConfig }) =>
      async displaySetInstanceUID => {
        const { hangingProtocolService, viewportGridService, uiNotificationService } =
          servicesManager.services;
        let updatedViewports = [];
        let viewportId = activeViewportId;

        if (!viewportId) {
          const { viewports } = viewportGridService.getState();
          viewportId = viewports.keys().next().value ?? null;
        }

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

        const haveDirtyMeasurementsInSimplifiedMode = checkHasDirtyAndSimplifiedMode({
          servicesManager,
          appConfig,
          displaySetInstanceUID,
        });

        try {
          if (!haveDirtyMeasurementsInSimplifiedMode) {
            updatedViewports = hangingProtocolService.getViewportsRequireUpdate(
              viewportId,
              displaySetInstanceUID,
              isHangingProtocolLayout
            );
            viewportGridService.setDisplaySetsForViewports(updatedViewports);

            if (!activeViewportId) {
              viewportGridService.setActiveViewportId(viewportId);
            }
          }
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
      },
  ],
};

const customOnDropHandlerCallback = async props => {
  const handled = checkHasDirtyAndSimplifiedMode(props);
  return Promise.resolve({ handled });
};

const checkHasDirtyAndSimplifiedMode = (props: CheckHasDirtyAndSimplifiedModeProps) => {
  const { servicesManager, appConfig, displaySetInstanceUID } = props;
  const simplifiedMode = appConfig.measurementTrackingMode === measurementTrackingMode.SIMPLIFIED;
  const { measurementService, displaySetService } = servicesManager.services;
  const measurements = measurementService.getMeasurements();
  const haveDirtyMeasurements =
    measurements.some(m => m.isDirty) ||
    (measurements.length && measurementService.getIsMeasurementDeletedIndividually());
  const displaySet = displaySetService.getDisplaySetByUID(displaySetInstanceUID);
  const hasDirtyAndSimplifiedMode =
    displaySet.Modality === 'SR' && simplifiedMode && haveDirtyMeasurements;
  return hasDirtyAndSimplifiedMode;
};

export { onDoubleClickHandler, customOnDropHandlerCallback };
