import React, { useState, useCallback, useEffect } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  Button,
  PanelSection,
  Icons,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Numeric,
} from '@ohif/ui-next';
import { Enums } from '@cornerstonejs/core';
import { useTranslation } from 'react-i18next';
import i18n from '@ohif/i18n';

// Helper function to safely convert any value to uppercase string
const toUpperCaseString = value => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).toUpperCase();
};

function useTranslate() {
  const { t, i18n: i18nextInstance } = useTranslation();
  const [lang, setLang] = useState(i18nextInstance?.language || i18n.language);

  useEffect(() => {
    const handle = () => setLang(i18n.language);
    i18n.on('languageChanged', handle);
    return () => i18n.off('languageChanged', handle);
  }, []);

  const translateText = useCallback(
    text => {
      if (text === null || text === undefined) {
        return text;
      }
      if (typeof text !== 'string') {
        return text;
      }
      if (text.includes(':')) {
        const [ns, key] = text.split(':');
        const fullKey = `${ns}:${key}`;
        const fromHook = t(fullKey);
        if (fromHook && fromHook !== fullKey) {
          return fromHook;
        }
        const fromNs = i18nextInstance?.t?.(key, { ns, defaultValue: key });
        if (fromNs && fromNs !== key) {
          return fromNs;
        }
        return i18n.t(key, { ns, defaultValue: key });
      }
      const fromHook = t(text);
      if (fromHook && fromHook !== text) {
        return fromHook;
      }
      return text;
    },
    [lang, t, i18nextInstance]
  );

  return { translateText };
}

function Header({ title, tooltip }) {
  const { translateText } = useTranslate();
  const renderedTitle = translateText(title);
  const renderedTooltip = typeof tooltip === 'string' ? translateText(tooltip) : tooltip;
  return (
    <div className="flex items-center space-x-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Icons.ByName
              name="info-link"
              className="text-primary h-3 w-3"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent
          sideOffset={4}
          className="max-w-xs"
        >
          <div>{renderedTooltip}</div>
        </TooltipContent>
      </Tooltip>
      <span className="text-muted-foreground text-xs uppercase tracking-wide">{renderedTitle}</span>
    </div>
  );
}

const DynamicVolumeControls = ({
  isPlaying,
  onPlayPauseChange,
  // fps
  fps,
  onFpsChange,
  minFps,
  maxFps,
  // Frames
  currentDimensionGroupNumber,
  onDimensionGroupChange,
  numDimensionGroups,
  onGenerate,
  onDoubleRangeChange,
  rangeValues,
  onDynamicClick,
}) => {
  const { translateText } = useTranslate();
  const [computedView, setComputedView] = useState(false);
  const [computeViewMode, setComputeViewMode] = useState(Enums.DynamicOperatorType.SUM);

  // Wrapper for onGenerate to handle potential errors
  const handleGenerate = () => {
    try {
      if (typeof onGenerate === 'function') {
        onGenerate(computeViewMode);
      } else {
        console.error('onGenerate is not a function', onGenerate);
      }
    } catch (error) {
      console.error('Error in onGenerate:', error);
    }
  };

  return (
    <div className="flex select-none flex-col">
      <PanelSection defaultOpen={true}>
        <PanelSection.Header>{translateText('DynamicVolume:Controls')}</PanelSection.Header>
        <PanelSection.Content className="bg-muted space-y-4 px-5 pt-2 pb-4">
          <div className="mb-4">
            <Header
              title="DynamicVolume:View"
              tooltip={'DynamicVolume:Select the view mode, 4D to view the dynamic volume or Computed to view the computed volume'}
            />
            <Tabs
              value={computedView ? 'computed' : '4d'}
              onValueChange={value => {
                const isComputed = value === 'computed';
                setComputedView(isComputed);
                if (!isComputed && typeof onDynamicClick === 'function') {
                  onDynamicClick();
                }
              }}
              className="my-2 w-full"
            >
              <TabsList className="w-full">
                <TabsTrigger
                  value="4d"
                  className="w-1/2"
                >
                  4D
                </TabsTrigger>
                <TabsTrigger
                  value="computed"
                  className="w-1/2"
                >
                  {translateText('DynamicVolume:Computed')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div>
            <DimensionGroupControls
              onPlayPauseChange={onPlayPauseChange}
              isPlaying={isPlaying}
              computedView={computedView}
              // fps
              fps={fps}
              onFpsChange={onFpsChange}
              minFps={minFps}
              maxFps={maxFps}
              //
              numDimensionGroups={numDimensionGroups}
              onDimensionGroupChange={onDimensionGroupChange}
              currentDimensionGroupNumber={currentDimensionGroupNumber}
            />
          </div>
          <div className={`mt-3 flex flex-col ${computedView ? '' : 'ohif-disabled'}`}>
            <Header
              title="DynamicVolume:Computed Operation"
              tooltip={
                <div>
                  {translateText('DynamicVolume:Operation Buttons (SUM, AVERAGE, SUBTRACT): Select the mathematical operation to be applied to the data set.')}
                  <br />
                  {translateText('DynamicVolume:Range Slider: Choose the numeric range of dimension groups within which the operation will be performed.')}
                  <br />
                  {translateText('DynamicVolume:Generate Button: Execute the chosen operation on the specified range of data.')}
                </div>
              }
            />
            <Tabs
              value={String(computeViewMode)}
              onValueChange={value => {
                setComputeViewMode(value);
              }}
              className="mt-2 w-full"
            >
              <TabsList className="w-full gap-1">
                <TabsTrigger
                  value={String(Enums.DynamicOperatorType.SUM)}
                  className="w-1/3"
                >
                  {translateText('DynamicVolume:SUM')}
                </TabsTrigger>
                <TabsTrigger
                  value={String(Enums.DynamicOperatorType.AVERAGE)}
                  className="w-1/3"
                >
                  {translateText('DynamicVolume:AVERAGE')}
                </TabsTrigger>
                <TabsTrigger
                  value={String(Enums.DynamicOperatorType.SUBTRACT)}
                  className="w-1/3"
                >
                  {translateText('DynamicVolume:SUBTRACT')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="mt-2 w-full">
              <Numeric.Container
                mode="doubleRange"
                min={1}
                max={numDimensionGroups || 1}
                values={rangeValues || [1, numDimensionGroups || 1]}
                onChange={onDoubleRangeChange || (() => {})}
              >
                <Numeric.DoubleRange showNumberInputs />
              </Numeric.Container>
            </div>
            <Button
              variant="default"
              size="sm"
              className="mt-2 h-[26px] w-[115px] self-start p-0"
              onClick={handleGenerate}
            >
              {translateText('DynamicVolume:Generate')}
            </Button>
          </div>
        </PanelSection.Content>
      </PanelSection>
    </div>
  );
};

export default DynamicVolumeControls;

function DimensionGroupControls({
  isPlaying,
  onPlayPauseChange,
  fps,
  minFps,
  maxFps,
  onFpsChange,
  numDimensionGroups,
  onDimensionGroupChange,
  currentDimensionGroupNumber,
  computedView,
}) {
  const { translateText } = useTranslate();
  const getPlayPauseIconName = () => (isPlaying ? 'icon-pause' : 'icon-play');

  return (
    <div className={computedView ? 'ohif-disabled' : ''}>
      <Header
        title="DynamicVolume:4D Controls"
        tooltip={
          <div>
            {translateText('DynamicVolume:Play/Pause Button: Begin or pause the animation of the 4D visualization.')}
            <br />
            {translateText('DynamicVolume:Dimension Group Selector: Navigate through individual dimension groups of the 4D data.')}
            <br />
            {translateText('DynamicVolume:FPS (Frames Per Second) Selector: Adjust the playback speed of the animation.')}
          </div>
        }
      />
      <div className="mt-3 flex justify-between">
        <Button
          id="play-pause-button"
          variant="secondary"
          size="default"
          className="w-[58px]"
          onClick={() => {
            if (typeof onPlayPauseChange === 'function') {
              onPlayPauseChange(!isPlaying);
            }
          }}
        >
          <Icons.ByName
            name={getPlayPauseIconName()}
            className="text-foreground h-[24px] w-[24px]"
          />
        </Button>

        <Numeric.Container
          mode="stepper"
          value={currentDimensionGroupNumber || 1}
          onChange={onDimensionGroupChange || (() => {})}
          min={1}
          max={numDimensionGroups || 1}
          step={1}
        >
          <div className="flex flex-col items-center">
            <Numeric.NumberStepper
              className="h-[28px] w-[58px]"
              direction="horizontal"
            />
            <Numeric.Label className="text-muted-foreground mt-1 text-sm">
              {translateText('DynamicVolume:Frame')}
            </Numeric.Label>
          </div>
        </Numeric.Container>

        <Numeric.Container
          mode="stepper"
          value={fps || 1}
          onChange={onFpsChange || (() => {})}
          min={minFps || 1}
          max={maxFps || 30}
          step={1}
        >
          <div className="flex flex-col items-center">
            <Numeric.NumberStepper
              className="h-[28px] w-[58px]"
              direction="horizontal"
            />
            <Numeric.Label className="text-muted-foreground mt-1 text-sm">
              {translateText('DynamicVolume:FPS')}
            </Numeric.Label>
          </div>
        </Numeric.Container>
      </div>
    </div>
  );
}
