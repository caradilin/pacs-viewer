import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons, PanelSection, Tooltip, TooltipContent, TooltipTrigger } from '../../index';
import DataRow from '../DataRow/DataRow';
import { createContext } from '../../lib/createContext';
import i18n from '@ohif/i18n';

interface MeasurementTableContext {
  data?: any[];
  onAction?: (e, command: string | string[], uid: string) => void;
  disableEditing?: boolean;
  isExpanded: boolean;
}

const [MeasurementTableProvider, useMeasurementTableContext] =
  createContext<MeasurementTableContext>('MeasurementTable', { data: [], isExpanded: true });

interface MeasurementDataProps extends MeasurementTableContext {
  title: string;
  children: React.ReactNode;
}

const MeasurementTable = ({
  data = [],
  onAction,
  isExpanded = true,
  title,
  children,
  disableEditing = false,
}: MeasurementDataProps) => {
  const { t, i18n: i18nextInstance } = useTranslation('MeasurementTable');
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

  const translateTitle = useCallback(
    (text: string) => {
      if (!text) {
        return text;
      }
      if (text.includes(':')) {
        const [ns, key] = text.split(':');
        // 优先使用 useTranslation 的 t('Namespace:key')，nsSeparator 默认 ':'
        // keySeparator 已设为 false，不会误拆 key
        const fullKey = `${ns}:${key}`;
        const fromFullKey = i18nextInstance?.t?.(fullKey);
        if (fromFullKey && fromFullKey !== fullKey) {
          return fromFullKey;
        }
        // 再用 ns 参数形式查
        const fromNs = i18nextInstance?.t?.(key, { ns, defaultValue: key });
        if (fromNs && fromNs !== key) {
          return fromNs;
        }
        return i18n.t(key, { ns, defaultValue: key });
      }
      return t(text);
    },
    [lang, t, i18nextInstance]
  );

  const translatedTitle = translateTitle(title);
  const amount = data.length;

  return (
    <MeasurementTableProvider
      data={data}
      onAction={onAction}
      isExpanded={isExpanded}
      disableEditing={disableEditing}
    >
      <PanelSection defaultOpen={true}>
        <PanelSection.Header
          key="measurementTableHeader"
          className="bg-popover"
        >
          <span>{`${translatedTitle} (${amount})`}</span>
        </PanelSection.Header>
        <PanelSection.Content key="measurementTableContent">{children}</PanelSection.Content>
      </PanelSection>
    </MeasurementTableProvider>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => {
  return <div className="measurement-table-header">{children}</div>;
};

const Body = () => {
  const { data } = useMeasurementTableContext('MeasurementTable.Body');

  if (!data || data.length === 0) {
    return (
      <div className="text-highlight mb-1 flex flex-1 items-center px-2 py-2 text-base">
        {useTranslation('MeasurementTable').t('No tracked measurements')}
      </div>
    );
  }

  return (
    <div className="measurement-table-body space-y-px">
      {data.map((item, index) => (
        <Row
          key={item.uid}
          item={item}
          index={index}
        />
      ))}
    </div>
  );
};

const Footer = ({ children }: { children: React.ReactNode }) => {
  return <div className="measurement-table-footer">{children}</div>;
};

interface MeasurementItem {
  uid: string;
  label: string;
  colorHex: string;
  isSelected: boolean;
  displayText: { primary: string[]; secondary: string[] };
  isVisible: boolean;
  isLocked: boolean;
  toolName: string;
  isExpanded: boolean;
  isUnmapped?: boolean;
  statusTooltip?: string;
}

interface RowProps {
  item: MeasurementItem;
  index: number;
}

const Row = ({ item, index }: RowProps) => {
  const { onAction, isExpanded, disableEditing } =
    useMeasurementTableContext('MeasurementTable.Row');

  const { uid } = item;
  return (
    <div data-cy={`measurement-table-row-${index}`}>
      <DataRow
        key={item.uid}
        description={item.label}
        number={index + 1}
        title={item.label}
        colorHex={item.colorHex}
        isSelected={item.isSelected}
        details={item.displayText}
        onDelete={e => onAction(e, 'removeMeasurement', uid)}
        onSelect={e => onAction(e, 'jumpToMeasurement', uid)}
        onRename={e => onAction(e, 'renameMeasurement', uid)}
        onToggleVisibility={e => onAction(e, 'toggleVisibilityMeasurement', uid)}
        onToggleLocked={e => onAction(e, 'toggleLockMeasurement', uid)}
        onColor={e => onAction(e, 'changeMeasurementColor', uid)}
        disableEditing={disableEditing}
        isVisible={item.isVisible}
        isLocked={item.isLocked}
      >
        {item.isUnmapped && <DataRow.Status.Warning tooltip={item.statusTooltip} />}
      </DataRow>
    </div>
  );
};

MeasurementTable.Header = Header;
MeasurementTable.Body = Body;
MeasurementTable.Footer = Footer;
MeasurementTable.Row = Row;

export default MeasurementTable;
