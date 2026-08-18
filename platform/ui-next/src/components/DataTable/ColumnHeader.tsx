import * as React from 'react';
import { useTranslation } from 'react-i18next';
import type { Column } from '@tanstack/react-table';
import { Button } from '../Button';
import { Icons } from '../Icons';
import type { ColumnMeta } from './types';

export function ColumnHeader<TData, TValue>({ column }: { column: Column<TData, TValue> }) {
  const { t } = useTranslation(['StudyList', 'Common']);
  const meta = (column.columnDef.meta as ColumnMeta | undefined) ?? undefined;

  // Use headerContent if provided, otherwise translate label via StudyList namespace
  const rawLabel = meta?.label ?? column.id;
  let translatedContent: React.ReactNode = meta?.headerContent ?? rawLabel;
  if (typeof translatedContent === 'string') {
    // Try multiple key variants for flexible lookup
    const key1 = `StudyList:${translatedContent}`;
    const key2 = `StudyList:${translatedContent.replace(/\s+/g, '')}`;
    const key3 = `Common:${translatedContent}`;
    translatedContent = t([key1, key2, key3], { defaultValue: translatedContent });
  }
  const align = meta?.align ?? 'left';
  const canSort = column.getCanSort();
  const sorted = column.getIsSorted() as false | 'asc' | 'desc';
  const justify =
    align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  const SortIcon =
    sorted === 'asc'
      ? Icons.SortingNewAscending
      : sorted === 'desc'
        ? Icons.SortingNewDescending
        : Icons.SortingNew;

  const translatedLabel = typeof rawLabel === 'string'
    ? t([`StudyList:${rawLabel}`, `Common:${rawLabel}`], { defaultValue: rawLabel })
    : (meta?.label ?? column.id);
  const sortPrefix = t('Common:Sort', { defaultValue: 'Sort' });
  const ariaLabel = `${sortPrefix} ${translatedLabel}`;

  return (
    <div className={`flex w-full items-center gap-1 ${justify}`}>
      {typeof translatedContent === 'string' ? <span>{translatedContent}</span> : translatedContent}
      {canSort && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(sorted === 'asc')}
          aria-label={ariaLabel}
          title={ariaLabel}
          className="px-1"
        >
          <SortIcon
            className="h-4 w-2.5"
            aria-hidden="true"
          />
        </Button>
      )}
    </div>
  );
}
