import React, { useEffect, useState, useCallback } from 'react';
import {
  ToolButtonList,
  ToolButton,
  ToolButtonListDefault,
  ToolButtonListDropDown,
  ToolButtonListItem,
  ToolButtonListDivider,
} from '@ohif/ui-next';
import { useToolbar } from '@ohif/core/src';
import { useTranslation } from 'react-i18next';
import i18n from '@ohif/i18n';

interface ToolButtonListWrapperProps {
  buttonSection: string;
  onInteraction?: (details: { itemId: string; commands?: Record<string, unknown> }) => void;
  id: string;
}

/**
 * Wraps the ToolButtonList component to handle the OHIF toolbar button structure
 * @param props - Component props
 * @returns Component
 * // test
 */
export default function ToolButtonListWrapper({ buttonSection, id }: ToolButtonListWrapperProps) {
  const { onInteraction, toolbarButtons } = useToolbar({
    buttonSection,
  });
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

  if (!toolbarButtons?.length) {
    return null;
  }

  const primary =
    toolbarButtons.find(button => button.componentProps.isActive)?.componentProps ||
    toolbarButtons[0].componentProps;

  const items = toolbarButtons.map(button => button.componentProps);

  return (
    <ToolButtonList>
      <ToolButtonListDefault>
        <div
          data-cy={`${id}-split-button-primary`}
          data-tool={primary.id}
          data-active={primary.isActive}
        >
          <ToolButton
            {...primary}
            onInteraction={({ itemId }) =>
              onInteraction?.({ id, itemId, commands: primary.commands })
            }
            className={primary.className}
          />
        </div>
      </ToolButtonListDefault>
      <ToolButtonListDivider className={primary.isActive ? 'opacity-0' : 'opacity-100'} />
      <div data-cy={`${id}-split-button-secondary`}>
        <ToolButtonListDropDown>
          {items.map(item => {
            return (
              <ToolButtonListItem
                key={item.id}
                {...item}
                data-cy={item.id}
                data-tool={item.id}
                data-active={item.isActive}
                onSelect={() => onInteraction?.({ id, itemId: item.id, commands: item.commands })}
              >
                <span className="pl-1">{translateText(item.label || item.tooltip || item.id)}</span>
              </ToolButtonListItem>
            );
          })}
        </ToolButtonListDropDown>
      </div>
    </ToolButtonList>
  );
}
