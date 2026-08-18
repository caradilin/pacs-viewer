import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '../Button';
import { Icons } from '../Icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip';
import { useTranslation } from 'react-i18next';
import i18n from '@ohif/i18n';

/**
 * ToolButtonList Component
 * Root component that wraps the default and dropdown sections
 * -----------------------------------------------
 */
interface ToolButtonListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const ToolButtonList = React.forwardRef<HTMLDivElement, ToolButtonListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ToolButtonList.displayName = 'ToolButtonList';

/**
 * ToolButtonListDefault Component
 * Container for the default/primary tool button
 * -----------------------------------------------
 */
interface ToolButtonListDefaultProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  tooltip?: string;
  disabledText?: string;
  disabled?: boolean;
}

const ToolButtonListDefault = React.forwardRef<HTMLDivElement, ToolButtonListDefaultProps>(
  ({ className, children, tooltip, disabledText, disabled, ...props }, ref) => {
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

    const translatedTooltip = translateText(tooltip);
    const translatedDisabledText = translateText(disabledText);
    const hasTooltip = translatedTooltip || translatedDisabledText;

    const defaultContent = (
      <div
        ref={ref}
        className={cn('flex items-center', className)}
        {...props}
      >
        {children}
      </div>
    );

    if (!hasTooltip) {
      return defaultContent;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>{defaultContent}</span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {translatedTooltip && <div>{translatedTooltip}</div>}
          {translatedDisabledText && disabled && <div className="text-muted-foreground">{translatedDisabledText}</div>}
        </TooltipContent>
      </Tooltip>
    );
  }
);
ToolButtonListDefault.displayName = 'ToolButtonListDefault';

/**
 * ToolButtonListDropDown Component
 * Container for the dropdown section with trigger and content
 * -----------------------------------------------
 */
interface ToolButtonListDropDownProps {
  children: React.ReactNode;
  className?: string;
}

const ToolButtonListDropDown = React.forwardRef<HTMLDivElement, ToolButtonListDropDownProps>(
  ({ children, className, ...props }, ref) => (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'text-foreground/80 hover:bg-background hover:text-highlight border-primary',
            'inline-flex h-10 w-5 items-center justify-center',
            '!rounded-tr-lg !rounded-br-lg !rounded-tl-none !rounded-bl-none',
            'bg-transparent',
            className
          )}
        >
          <Icons.ByName
            name="chevron-down"
            className="text-primary h-5 w-5"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        ref={ref}
        side="bottom"
        align="start"
        alignOffset={-40}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
);
ToolButtonListDropDown.displayName = 'ToolButtonListDropDown';

/**
 * ToolButtonListItem Component
 * Individual item in the dropdown menu
 * -----------------------------------------------
 */
interface ToolButtonListItemProps extends React.ComponentProps<typeof DropdownMenuItem> {
  icon?: string;
  children?: React.ReactNode;
  className?: string;
  disabledText?: string;
  tooltip?: string;
}

const ToolButtonListItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  ToolButtonListItemProps
>(({ className, children, icon, disabledText, tooltip, disabled, ...props }, ref) => {
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

  const translatedTooltip = translateText(tooltip);
  const translatedDisabledText = translateText(disabledText);
  const defaultTooltip = translatedTooltip || (typeof children === 'string' ? children : undefined);

  const menuItem = (
    <DropdownMenuItem
      ref={ref}
      className={cn('flex items-center space-x-2', className)}
      disabled={disabled}
      {...props}
    >
      {icon && (
        <Icons.ByName
          name={icon || 'MissingIcon'}
          className="h-6 w-6"
        />
      )}
      {children}
    </DropdownMenuItem>
  );

  // Todo: there is a weird issue where i can't control the duration of the delay
  // for the items in this list, causing the tooltip to show up too early in the
  // dropdown menu. So i'm just removing the tooltip for list items unless the disabledText is set.
  if (!disabled) {
    return menuItem;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>{menuItem}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {defaultTooltip && <div>{defaultTooltip}</div>}
        {translatedDisabledText && disabled && <div className="text-muted-foreground">{translatedDisabledText}</div>}
      </TooltipContent>
    </Tooltip>
  );
});
ToolButtonListItem.displayName = 'ToolButtonListItem';

/**
 * ToolButtonListDivider Component
 * Divider between items in the dropdown menu
 * -----------------------------------------------
 */
const ToolButtonListDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('bg-primary h-5 w-px self-center', className)}
    {...props}
  />
));
ToolButtonListDivider.displayName = 'ToolButtonListDivider';

export {
  ToolButtonList,
  ToolButtonListDefault,
  ToolButtonListDropDown,
  ToolButtonListItem,
  ToolButtonListDivider,
};
