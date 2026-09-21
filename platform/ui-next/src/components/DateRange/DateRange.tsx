import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { Calendar } from '../Calendar';
import * as Popover from '../Popover';

export type DatePickerWithRangeProps = {
  id: string;
  /** YYYYMMDD (19921022) */
  startDate: string;
  /** YYYYMMDD (19921022) */
  endDate: string;
  /** Callback that received { startDate: string(YYYYMMDD), endDate: string(YYYYMMDD)} */
  onChange: (value: { startDate: string; endDate: string }) => void;
};

export function DatePickerWithRange({
  className,
  id,
  startDate,
  endDate,
  onChange,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & DatePickerWithRangeProps) {
  const { t } = useTranslation('DatePicker');
  // Limit the year dropdown (and month navigation) to the last 30 years up to the current year.
  const currentYear = new Date().getFullYear();
  const navStartMonth = new Date(currentYear - 30, 0);
  const navEndMonth = new Date(currentYear, 11);
  const [start, setStart] = React.useState<string>(
    startDate ? format(parse(startDate, 'yyyyMMdd', new Date()), 'yyyy-MM-dd') : ''
  );
  const [end, setEnd] = React.useState<string>(
    endDate ? format(parse(endDate, 'yyyyMMdd', new Date()), 'yyyy-MM-dd') : ''
  );
  const [openEnd, setOpenEnd] = React.useState(false);

  const handleStartSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      setStart(formattedDate);
      setOpenEnd(true);
      onChange({
        startDate: format(selectedDate, 'yyyyMMdd'),
        endDate: end.replace(/-/g, ''),
      });
    }
  };

  const handleEndSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      setEnd(formattedDate);
      setOpenEnd(false);
      onChange({
        startDate: start.replace(/-/g, ''),
        endDate: format(selectedDate, 'yyyyMMdd'),
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
    const value = e.target.value;
    const date = parse(value, 'yyyy-MM-dd', new Date());
    if (type === 'start') {
      setStart(value);
      if (isValid(date)) {
        handleStartSelect(date);
      }
    } else {
      setEnd(value);
      if (isValid(date)) {
        handleEndSelect(date);
      }
    }
  };

  React.useEffect(() => {
    setStart(startDate ? format(parse(startDate, 'yyyyMMdd', new Date()), 'yyyy-MM-dd') : '');
    setEnd(endDate ? format(parse(endDate, 'yyyyMMdd', new Date()), 'yyyy-MM-dd') : '');
  }, [startDate, endDate]);

  return (
    <div className={cn('flex gap-2', className)}>
      <Popover.Popover>
        <Popover.PopoverTrigger asChild>
          <div className="relative w-full">
            {!start && (
              <CalendarIcon className="text-primary absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
            )}
            <input
              id={`${id}-start`}
              type="text"
              placeholder={t('Start', 'Start')}
              autoComplete="off"
              value={start}
              onChange={e => handleInputChange(e, 'start')}
              className={cn(
                'border-input focus:border-ring hover:text-foreground placeholder:text-muted-foreground bg-background hover:bg-background h-7 w-full justify-start rounded border py-1 pl-1.5 pr-0.5 text-left text-base font-normal'
              )}
              data-cy="input-date-range-start"
            />
          </div>
        </Popover.PopoverTrigger>
        <Popover.PopoverContent
          className="w-auto overflow-hidden p-0"
          align="start"
        >
          <Calendar
            autoFocus
            mode="single"
            captionLayout="dropdown"
            defaultMonth={start ? parse(start, 'yyyy-MM-dd', new Date()) : new Date()}
            selected={start ? parse(start, 'yyyy-MM-dd', new Date()) : undefined}
            onSelect={handleStartSelect}
            startMonth={navStartMonth}
            endMonth={navEndMonth}
            numberOfMonths={1}
          />
        </Popover.PopoverContent>
      </Popover.Popover>

      <Popover.Popover
        open={openEnd}
        onOpenChange={setOpenEnd}
      >
        <Popover.PopoverTrigger asChild>
          <div className="relative w-full">
            {!end && (
              <CalendarIcon className="text-primary absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
            )}
            <input
              id={`${id}-end`}
              type="text"
              placeholder={t('End', 'End')}
              autoComplete="off"
              value={end}
              onChange={e => handleInputChange(e, 'end')}
              className={cn(
                'border-input focus:border-ring hover:text-foreground placeholder:text-muted-foreground bg-background hover:bg-background h-7 w-full justify-start rounded border py-1 pl-1.5 pr-0.5 text-left text-base font-normal'
              )}
              data-cy="input-date-range-end"
            />
          </div>
        </Popover.PopoverTrigger>
        <Popover.PopoverContent
          className="w-auto overflow-hidden p-0"
          align="start"
        >
          <Calendar
            autoFocus
            mode="single"
            captionLayout="dropdown"
            defaultMonth={start ? parse(start, 'yyyy-MM-dd', new Date()) : new Date()}
            selected={end ? parse(end, 'yyyy-MM-dd', new Date()) : undefined}
            onSelect={handleEndSelect}
            startMonth={navStartMonth}
            endMonth={navEndMonth}
            numberOfMonths={1}
          />
        </Popover.PopoverContent>
      </Popover.Popover>
    </div>
  );
}
