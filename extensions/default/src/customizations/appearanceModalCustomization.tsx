import React, { useCallback, useEffect, useState } from 'react';
import {
  AppearanceModal,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
  useActiveTheme,
  themePresets,
} from '@ohif/ui-next';
import { useTranslation } from 'react-i18next';
import i18n from '@ohif/i18n';

function AppearanceModalDefault() {
  const { activeTheme, setActiveTheme, customCss, applyCustomTheme, clearCustomTheme } =
    useActiveTheme();
  const { t: defaultT, i18n: i18nextInstance } = useTranslation();
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

  const t = useCallback(
    (key: string, defaultValue?: string) => {
      return i18n.t(key, { ns: 'AppearanceModal', defaultValue: defaultValue || key });
    },
    [lang]
  );

  const [draftCss, setDraftCss] = React.useState(() => customCss);
  const [isCustomOpen, setIsCustomOpen] = React.useState(() => activeTheme === 'custom');
  const [parseFailed, setParseFailed] = React.useState(false);

  const handleToggleCustom = () => {
    setIsCustomOpen(!isCustomOpen);
  };

  const handleSave = () => {
    setParseFailed(!applyCustomTheme(draftCss));
  };

  const handleClear = () => {
    clearCustomTheme();
    setDraftCss('');
    setParseFailed(false);
    setIsCustomOpen(false);
  };

  const handlePresetChange = (value: string) => {
    if (value === 'custom') {
      // Selecting "Custom" restores the saved custom theme; the draft is only
      // committed through the explicit Apply button.
      setIsCustomOpen(true);
      if (customCss) {
        applyCustomTheme(customCss);
      }
    } else {
      setIsCustomOpen(false);
      setActiveTheme(value);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftCss(e.target.value);
    setParseFailed(false);
  };

  const getThemeLabel = useCallback((themeName: string) => {
    if (themeName === 'default') {
      return t('Default Theme');
    }
    if (themeName === 'custom') {
      return t('Custom');
    }
    const preset = themePresets.find(p => p.name === themeName);
    if (preset) {
      return t(preset.label);
    }
    return themeName;
  }, [t]);

  return (
    <AppearanceModal>
      <AppearanceModal.Body>
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-4">
          <AppearanceModal.SectionLabel>{t('Theme')}</AppearanceModal.SectionLabel>
          <div>
            <Select
              value={activeTheme}
              onValueChange={handlePresetChange}
            >
              <SelectTrigger
                className="w-[200px]"
                aria-label={t('Theme')}
              >
                <SelectValue>{getThemeLabel(activeTheme)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{t('Default Theme')}</SelectItem>
                {themePresets.map(preset => (
                  <SelectItem
                    key={preset.name}
                    value={preset.name}
                  >
                    {t(preset.label)}
                  </SelectItem>
                ))}
                {(customCss || draftCss) && <SelectItem value="custom">{t('Custom')}</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div className="col-start-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCustom}
            >
              {isCustomOpen ? t('Hide') : t('Custom Theme')}
            </Button>
          </div>
        </div>

        {isCustomOpen && (
          <div className="mt-4 flex flex-col space-y-2">
            <textarea
              value={draftCss}
              onChange={handleTextChange}
              placeholder={t('Paste your custom theme color tokens here')}
              aria-label={t('Paste your custom theme color tokens here')}
              rows={8}
              className="bg-muted text-foreground border-input placeholder:text-muted-foreground focus:ring-ring rounded-md border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-inset"
            />
            {parseFailed && (
              <span
                className="text-destructive text-sm"
                role="alert"
              >
                {t('No valid theme tokens found')}
              </span>
            )}
            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
              >
                {t('Apply')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                {t('Clear')}
              </Button>
            </div>
          </div>
        )}
      </AppearanceModal.Body>
    </AppearanceModal>
  );
}

export default {
  'ohif.appearanceModal': AppearanceModalDefault,
};
