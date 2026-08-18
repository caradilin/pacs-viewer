import React from 'react';
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuItem,
  Icons,
} from '@ohif/ui-next';
import { useTranslation } from 'react-i18next';
import i18n from '@ohif/i18n';

export default {
  'ohif.menuContent': function (props) {
    const { item: topLevelItem, commandsManager, servicesManager, ...rest } = props;
    const { t, i18n: i18nextInstance } = useTranslation();
    const [lang, setLang] = React.useState(i18nextInstance?.language || i18n.language);

    React.useEffect(() => {
      const handleLanguageChanged = () => {
        setLang(i18n.language);
      };
      i18n.on('languageChanged', handleLanguageChanged);
      return () => {
        i18n.off('languageChanged', handleLanguageChanged);
      };
    }, []);

    const translateLabel = React.useCallback(
      (label: string) => {
        if (!label) {
          return label;
        }
        if (label.includes(':')) {
          const [ns, key] = label.split(':');
          return i18n.t(key, { ns, defaultValue: key });
        }
        return label;
      },
      [lang]
    );

    const content = function (subProps) {
      const { item: subItem } = subProps;

      // Regular menu item
      const isDisabled = subItem.selector && !subItem.selector({ servicesManager });

      return (
        <DropdownMenuItem
          disabled={isDisabled}
          onSelect={() => {
            commandsManager.runAsync(subItem.commands, {
              ...subItem.commandOptions,
              ...rest,
            });
          }}
          className="gap-[6px]"
        >
          {subItem.iconName && (
            <Icons.ByName
              name={subItem.iconName}
              className="-ml-1"
            />
          )}
          {translateLabel(subItem.label)}
        </DropdownMenuItem>
      );
    };

    // If item has sub-items, render a submenu
    if (topLevelItem.items) {
      return (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-[6px]">
            {topLevelItem.iconName && (
              <Icons.ByName
                name={topLevelItem.iconName}
                className="-ml-1"
              />
            )}
            {translateLabel(topLevelItem.label)}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {topLevelItem.items.map(subItem => content({ ...props, item: subItem }))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      );
    }

    return content({ ...props, item: topLevelItem });
  },
};
