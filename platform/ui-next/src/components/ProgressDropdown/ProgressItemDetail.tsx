import React, { useState, useMemo, useCallback, useEffect, ReactElement } from 'react';
import { Icons } from '../Icons';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../Tooltip';
import { ProgressDropdownOption, ProgressDropdownOptionPropType } from './types';
import { useTranslation } from 'react-i18next';
import i18n from '@ohif/i18n';

const MAX_TOOLTIP_LENGTH = 150;
const iconClassNames = 'grow-0 text-highlight h-4 w-4 mt-1 mr-2 mb-0 ml-1';

function useTranslateText() {
  const { t, i18n: i18nextInstance } = useTranslation();
  const [lang, setLang] = useState(i18nextInstance?.language || i18n.language);

  useEffect(() => {
    const handle = () => setLang(i18n.language);
    i18n.on('languageChanged', handle);
    return () => i18n.off('languageChanged', handle);
  }, []);

  return useCallback(
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
}

const ProgressItemDetail = ({ option }: { option: ProgressDropdownOption }): ReactElement => {
  const { label, info, completed } = option;
  const translateText = useTranslateText();
  const [truncate, setTruncate] = useState(true);
  const handleOnHideTooltip = () => setTruncate(true);
  let icon;

  if (completed) {
    icon = 'status-tracked';
  } else if (info) {
    icon = 'launch-info';
  }

  const renderedInfo = useMemo(() => translateText(info), [info, translateText]);
  const renderedLabel = useMemo(() => translateText(label), [label, translateText]);

  const tooltipText = useMemo(() => {
    if (!renderedInfo) {
      return renderedInfo;
    }
    if (!truncate || renderedInfo.length <= MAX_TOOLTIP_LENGTH) {
      return renderedInfo;
    }

    const handleReadMoreClick = e => {
      setTruncate(false);
      e.stopPropagation();
      e.preventDefault();
    };

    return (
      <>
        {renderedInfo.slice(0, MAX_TOOLTIP_LENGTH)}
        <button
          className="text-primary font-bold"
          onClick={handleReadMoreClick}
        >
          &nbsp;{translateText('Common:Read more...')}
        </button>
      </>
    );
  }, [renderedInfo, truncate, translateText]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleOnHideTooltip();
    }
  };

  const iconContent = (
    <>
      {icon && (
        <div>
          <Icons.ByName
            name={icon}
            className={iconClassNames}
          />
        </div>
      )}
      {!icon && <div className={iconClassNames} />}
    </>
  );

  return (
    <>
      {info && (
        <TooltipProvider delayDuration={200}>
          <Tooltip onOpenChange={handleOpenChange}>
            <TooltipTrigger asChild>{iconContent}</TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="start"
              className={'max-w-xs'}
            >
              {tooltipText}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {!info && iconContent}

      <div className="grow overflow-hidden text-ellipsis whitespace-nowrap text-base leading-6">
        {renderedLabel}
      </div>
    </>
  );
};

ProgressItemDetail.propTypes = {
  option: ProgressDropdownOptionPropType.isRequired,
};

export default ProgressItemDetail;
