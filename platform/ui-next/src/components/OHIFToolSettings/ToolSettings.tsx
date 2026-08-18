import React, { useState, useEffect, useCallback, useMemo } from 'react';
import RowInputRange from './RowInputRange';
import RowSegmentedControl from './RowSegmentedControl';
import RowDoubleRange from './RowDoubleRange';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { Label } from '../Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Select';
import { Switch } from '../Switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useTranslation } from 'react-i18next';
import i18n from '@ohif/i18n';

const SETTING_TYPES = {
  RANGE: 'range',
  RADIO: 'radio',
  CUSTOM: 'custom',
  DOUBLE_RANGE: 'double-range',
  BUTTON: 'button',
  CHECKBOX: 'checkbox',
  SWITCH: 'switch',
  SELECT: 'select',
};

function ToolSettings({ options }) {
  const { t, i18n: i18nextInstance } = useTranslation();
  const [lang, setLang] = useState(i18nextInstance?.language || i18n.language);

  useEffect(() => {
    const handleLanguageChanged = () => {
      setLang(i18n.language);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const translateText = useCallback(
    text => {
      if (!text || typeof text !== 'string') {
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

  const translateOption = useCallback(
    option => {
      if (!option) {
        return option;
      }
      const translated = { ...option };
      if (translated.name) {
        translated.name = translateText(translated.name);
      }
      if (translated.tooltip) {
        translated.tooltip = translateText(translated.tooltip);
      }
      if (translated.values && Array.isArray(translated.values)) {
        translated.values = translated.values.map(value => ({
          ...value,
          label: translateText(value.label),
        }));
      }
      return translated;
    },
    [translateText]
  );

  if (!options) {
    return null;
  }

  if (typeof options === 'function') {
    const OptionsComponent = options;
    return <OptionsComponent />;
  }

  const translatedOptions = useMemo(
    () => options.map(translateOption),
    [options, translateOption]
  );

  return (
    <div className="text-foreground space-y-2 pb-4">
      {translatedOptions?.map(option => {
        if (option.condition && option.condition?.({ options: translatedOptions }) === false) {
          return null;
        }

        switch (option.type) {
          case SETTING_TYPES.RANGE:
            return renderRangeSetting(option);
          case SETTING_TYPES.RADIO:
            return renderRadioSetting(option);
          case SETTING_TYPES.DOUBLE_RANGE:
            return renderDoubleRangeSetting(option);
          case SETTING_TYPES.CUSTOM:
            return renderCustomSetting(option);
          case SETTING_TYPES.BUTTON:
            return renderButtonSetting(option);
          case SETTING_TYPES.CHECKBOX:
            return renderCheckboxSetting(option);
          case SETTING_TYPES.SWITCH:
            return renderSwitchSetting(option);
          case SETTING_TYPES.SELECT:
            return renderSelectSetting(option);
          default:
            return null;
        }
      })}
    </div>
  );
}

const renderLabelWithTooltip = (label: React.ReactNode, tooltip?: string) => {
  if (!label) {
    return null;
  }

  if (!tooltip) {
    return <span>{label}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help">{label}</span>
      </TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
  );
};

const renderRangeSetting = option => {
  return (
    <div
      className="flex items-center"
      key={option.id}
    >
      <div className="w-1/3 text-[13px]">{renderLabelWithTooltip(option.name, option.tooltip)}</div>
      <div
        className="w-2/3"
        data-cy={option.id}
      >
        <RowInputRange
          minValue={option.min}
          maxValue={option.max}
          step={option.step}
          value={option.value}
          onChange={value => option.onChange?.(value)}
          allowNumberEdit={true}
          inputClassName="ml-1 w-4/5 cursor-pointer"
        />
      </div>
    </div>
  );
};

const renderRadioSetting = option => {
  return (
    <RowSegmentedControl
      key={option.id}
      option={option}
      onChange={option.onChange}
    />
  );
};

function renderDoubleRangeSetting(option) {
  return (
    <RowDoubleRange
      key={option.id}
      values={option.value}
      onChange={option.onChange}
      minValue={option.min}
      maxValue={option.max}
      step={option.step}
      showLabel={false}
      tooltip={option.tooltip}
    />
  );
}

const renderCustomSetting = option => {
  return (
    <div key={option.id}>
      {typeof option.children === 'function' ? option.children() : option.children}
    </div>
  );
};

const renderButtonSetting = option => {
  const button = (
    <Button
      key={option.id}
      variant={option.variant || 'ghost'}
      className={option.className || ''}
      onClick={() => option.onChange()}
    >
      {option.name}
    </Button>
  );

  if (option.tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="top">{option.tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
};

const renderCheckboxLabel = option => {
  return (
    <Label
      htmlFor={option.id}
      className="cursor-pointer"
    >
      {renderLabelWithTooltip(option.name, option.tooltip)}
    </Label>
  );
};

const renderCheckboxSetting = option => {
  return (
    <div
      key={option.id}
      className="flex items-center gap-2"
    >
      <Checkbox
        id={option.id}
        checked={option.value}
        onCheckedChange={checked => {
          option.onChange?.(checked);
        }}
      />
      {renderCheckboxLabel(option)}
    </div>
  );
};

const renderSwitchSetting = option => {
  return (
    <div
      key={option.id}
      className="flex items-center gap-2"
    >
      <Switch
        id={option.id}
        checked={option.value}
        onCheckedChange={checked => {
          option.onChange?.(checked);
        }}
      />
      {renderCheckboxLabel(option)}
    </div>
  );
};

const renderSelectSetting = option => {
  return (
    <div
      className="flex items-center"
      key={option.id}
    >
      <div className="w-1/3 text-[13px]">{renderLabelWithTooltip(option.name, option.tooltip)}</div>
      <div
        className="w-2/3"
        data-cy={option.id}
      >
        <Select
          onValueChange={value => option.onChange?.(value)}
          value={option.value}
        >
          <SelectTrigger className="w-full overflow-hidden">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {option.values.map(value => (
              <SelectItem
                key={value.id}
                value={value.id}
                data-cy={value.id}
              >
                {value.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ToolSettings;
