import React, { useEffect, useState, useCallback } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip';
import { Icons } from '../Icons';
import { Button } from '../Button';
import { cn } from '../../lib/utils';
import { useIconPresentation } from '../../contextProviders/IconPresentationProvider';
import { useTranslation } from 'react-i18next';
import i18n from '@ohif/i18n';

const baseClasses = '!rounded-lg inline-flex items-center justify-center';
const defaultClasses = 'bg-transparent text-foreground/80 hover:bg-background hover:text-highlight';
const activeClasses = 'bg-highlight text-background hover:!bg-highlight/80';
const toggledClasses = 'bg-transparent text-highlight hover:bg-muted';
const disabledClasses =
  'text-foreground hover:bg-muted hover:text-highlight opacity-40 cursor-not-allowed';

const sizeClasses = {
  default: {
    buttonSizeClass: 'w-10 h-10',
    iconSizeClass: 'h-7 w-7',
  },
  small: {
    buttonSizeClass: 'w-8 h-8',
    iconSizeClass: 'h-6 w-6',
  },
  tiny: {
    buttonSizeClass: 'w-6 h-6',
    iconSizeClass: 'h-4 w-4',
  },
};

interface ToolButtonProps {
  id: string;
  icon?: string;
  label?: string;
  tooltip?: string;
  size?: 'default' | 'small';
  isActive?: boolean;
  isToggled?: boolean;
  disabled?: boolean;
  disabledText?: string;
  commands?: Record<string, unknown>;
  onInteraction?: (details: { itemId: string; commands?: Record<string, unknown> }) => void;
  className?: string;
  children?: React.ReactNode;
}

function ToolButton(props: ToolButtonProps) {
  const {
    id,
    icon = 'MissingIcon',
    label,
    tooltip,
    size = 'default',
    disabled = false,
    isActive = false,
    isToggled = false,
    disabledText,
    commands,
    onInteraction,
    className,
    children,
  } = props;

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
    (text: string) => {
      if (!text) {
        return text;
      }
      if (text.includes(':')) {
        const [ns, key] = text.split(':');
        return i18n.t(key, { ns, defaultValue: key });
      }
      return text;
    },
    [lang]
  );

  const { className: iconClassName } = useIconPresentation();
  const { buttonSizeClass, iconSizeClass } = sizeClasses[size] || sizeClasses.default;

  const buttonClasses = cn(
    baseClasses,
    buttonSizeClass,
    disabled ? disabledClasses : isActive ? activeClasses : isToggled ? toggledClasses : defaultClasses,
    className
  );

  const translatedLabel = translateText(label);
  const translatedTooltip = translateText(tooltip);
  const translatedDisabledText = translateText(disabledText);

  const defaultTooltip = translatedLabel;
  const disabledTooltip = disabled && translatedDisabledText ? translatedDisabledText : null;
  const hasSecondaryTooltip = translatedTooltip || disabledTooltip;

  const showTooltip = hasSecondaryTooltip || defaultTooltip;

  return (
    <Tooltip>
      <TooltipTrigger
        asChild
        className={cn(disabled && 'cursor-not-allowed')}
      >
        {/* TooltipTrigger is a span since a disabled button does not fire events and the tooltip
        will not show. */}
        <span
          data-cy={id}
          data-tool={id}
          data-active={isActive}
          data-toggled={isToggled}
        >
          <Button
            className={buttonClasses}
            onClick={() => {
              if (!disabled) {
                onInteraction?.({ itemId: id, commands });
              }
            }}
            variant="ghost"
            size="icon"
            aria-label={defaultTooltip}
            disabled={disabled}
            name={id}
          >
            {children || (
              <Icons.ByName
                name={icon}
                className={iconClassName || iconSizeClass}
              />
            )}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="text-wrap w-auto max-w-sm whitespace-normal break-words"
      >
        {showTooltip && (
          <div className="space-y-1">
            {defaultTooltip && <div className="text-sm">{defaultTooltip}</div>}
            {disabledTooltip ? (
              <div className="text-muted-foreground text-xs">{disabledTooltip}</div>
            ) : (
              translatedTooltip && <div className="text-muted-foreground text-xs">{translatedTooltip}</div>
            )}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export default ToolButton;
