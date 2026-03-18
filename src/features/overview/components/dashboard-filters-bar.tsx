'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Tag,
  X
} from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { getAccounts } from '@/features/accounts/data/get-accounts';
import { getCategories } from '@/features/categories/data/get-categories';
import {
  useDashboardFilters,
  TIME_RANGE_LABELS,
  type TimeRange
} from '@/hooks/use-dashboard-filters';

const TIME_RANGE_OPTIONS: TimeRange[] = [
  'this_month',
  'last_3_months',
  'last_6_months',
  'this_year',
  'custom'
];

const MONTHS_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic'
];

function CustomRangePopoverContent({
  pickerYear,
  setPickerYear,
  customFrom,
  customTo,
  setCustomRange
}: {
  pickerYear: number;
  setPickerYear: React.Dispatch<React.SetStateAction<number>>;
  customFrom: Date;
  customTo: Date;
  setCustomRange: (from: Date, to: Date) => void;
}) {
  const now = new Date();

  const handleMonthSelect = (monthIndex: number) => {
    const from = new Date(pickerYear, monthIndex, 1);
    const endOfMonth = new Date(pickerYear, monthIndex + 1, 0, 23, 59, 59);
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );
    const to = endOfToday < endOfMonth ? endOfToday : endOfMonth;
    setCustomRange(from, to);
  };

  const isMonthActive = (monthIndex: number) =>
    customFrom.getFullYear() === pickerYear &&
    customFrom.getMonth() === monthIndex &&
    customFrom.getDate() === 1;

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <div className='mb-2 flex items-center justify-between'>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={() => setPickerYear((y) => y - 1)}
          >
            <ChevronLeft className='size-4' />
          </Button>
          <span className='text-sm font-medium'>{pickerYear}</span>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={() => setPickerYear((y) => y + 1)}
          >
            <ChevronRight className='size-4' />
          </Button>
        </div>
        <div className='grid grid-cols-4 gap-1'>
          {MONTHS_SHORT.map((label, i) => (
            <Button
              key={label}
              variant={isMonthActive(i) ? 'secondary' : 'ghost'}
              size='sm'
              className='h-8 text-xs font-normal'
              onClick={() => handleMonthSelect(i)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className='border-t pt-4'>
        <div className='text-muted-foreground mb-2 text-xs'>
          Desde → Hasta (rango libre)
        </div>
        <div className='flex gap-4'>
          <div>
            <CalendarComponent
              mode='single'
              selected={customFrom}
              onSelect={(d) => {
                if (d) {
                  const to = d > customTo ? d : customTo;
                  setCustomRange(d, to);
                }
              }}
            />
          </div>
          <div>
            <CalendarComponent
              mode='single'
              selected={customTo}
              onSelect={(d) => {
                if (d && d >= customFrom) setCustomRange(customFrom, d);
              }}
              disabled={(date) => date < customFrom}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardFiltersBar() {
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());
  const {
    timeRange,
    categoryIds,
    accountId,
    customFrom,
    customTo,
    setTimeRange,
    setCategoryIds,
    setAccountId,
    setCustomRange
  } = useDashboardFilters();

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  function toggleCategory(id: number) {
    if (categoryIds.includes(id)) {
      setCategoryIds(categoryIds.filter((c) => c !== id));
    } else {
      setCategoryIds([...categoryIds, id]);
    }
  }

  const accountOptions = [
    { value: 0, label: 'Todas las cuentas' },
    ...accounts.map((a) => ({
      value: a.id,
      label: `${a.name} (${a.currency})`
    }))
  ];

  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='flex items-center gap-2'>
          <Calendar className='text-muted-foreground size-4 shrink-0' />
          <Select
            value={timeRange}
            onValueChange={(v) => setTimeRange(v as TimeRange)}
          >
            <SelectTrigger className='h-8 w-[160px] text-sm sm:w-[180px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {TIME_RANGE_LABELS[opt]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {timeRange === 'custom' && (
          <Popover
            onOpenChange={(open) => {
              if (open) setPickerYear(customFrom.getFullYear());
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='h-8 min-w-0 justify-start gap-1 px-2 text-xs sm:px-3 sm:text-sm'
              >
                <CalendarIcon className='size-3.5 opacity-50' />
                {format(customFrom, 'dd/MM/yy', { locale: es })} →{' '}
                {format(customTo, 'dd/MM/yy', { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-3' align='start'>
              <CustomRangePopoverContent
                pickerYear={pickerYear}
                setPickerYear={setPickerYear}
                customFrom={customFrom}
                customTo={customTo}
                setCustomRange={setCustomRange}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className='flex items-center gap-2'>
        <Select
          value={String(accountId ?? 0)}
          onValueChange={(v) => setAccountId(Number(v) || undefined)}
        >
          <SelectTrigger className='h-8 w-[140px] text-sm sm:w-[160px]'>
            <SelectValue placeholder='Cuenta' />
          </SelectTrigger>
          <SelectContent>
            {accountOptions.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categories.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='h-8 gap-1.5 border-dashed px-2 sm:px-3'
            >
              <Tag className='text-muted-foreground size-3.5' />
              <span className='hidden sm:inline'>Categorías</span>
              {categoryIds.length > 0 ? (
                <span className='bg-muted rounded px-1.5 py-0.5 text-xs font-medium'>
                  {categoryIds.length}
                </span>
              ) : (
                <ChevronDown className='size-3.5 opacity-50' />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[220px] p-2' align='start'>
            <div className='max-h-[240px] space-y-1 overflow-y-auto'>
              {categories.map((cat) => {
                const isActive = categoryIds.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className='hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm'
                  >
                    <Checkbox
                      checked={isActive}
                      onCheckedChange={() => toggleCategory(cat.id)}
                    />
                    <span
                      className='min-w-0 flex-1 truncate'
                      style={cat.color ? { color: cat.color } : undefined}
                    >
                      {cat.name}
                    </span>
                  </label>
                );
              })}
            </div>
            {categoryIds.length > 0 && (
              <Button
                variant='ghost'
                size='sm'
                className='mt-2 h-7 w-full justify-center gap-1 text-xs'
                onClick={() => setCategoryIds([])}
              >
                <X className='size-3' />
                Limpiar
              </Button>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
