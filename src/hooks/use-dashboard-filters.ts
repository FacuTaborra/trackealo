'use client';

import { parseAsArrayOf, parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';
import { useMemo } from 'react';

export type TimeRange = 'this_month' | 'last_3_months' | 'last_6_months' | 'this_year';

const TIME_RANGE_VALUES: TimeRange[] = [
  'this_month',
  'last_3_months',
  'last_6_months',
  'this_year'
];

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  this_month: 'Este mes',
  last_3_months: 'Últimos 3 meses',
  last_6_months: 'Últimos 6 meses',
  this_year: 'Este año'
};

function getDateRange(timeRange: TimeRange): { fromDate: Date; toDate: Date } {
  const now = new Date();
  const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  switch (timeRange) {
    case 'this_month':
      return {
        fromDate: new Date(now.getFullYear(), now.getMonth(), 1),
        toDate
      };
    case 'last_3_months':
      return {
        fromDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        toDate
      };
    case 'last_6_months':
      return {
        fromDate: new Date(now.getFullYear(), now.getMonth() - 5, 1),
        toDate
      };
    case 'this_year':
      return {
        fromDate: new Date(now.getFullYear(), 0, 1),
        toDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59)
      };
  }
}

export function useDashboardFilters() {
  const [{ timeRange, categoryIds }, setFilters] = useQueryStates({
    timeRange: parseAsStringEnum<TimeRange>(TIME_RANGE_VALUES).withDefault(
      'this_month'
    ),
    categoryIds: parseAsArrayOf(parseAsInteger).withDefault([])
  });

  const { fromDate, toDate } = useMemo(
    () => getDateRange(timeRange),
    [timeRange]
  );

  return {
    timeRange,
    categoryIds,
    fromDate,
    toDate,
    setTimeRange: (value: TimeRange) => setFilters({ timeRange: value }),
    setCategoryIds: (value: number[]) =>
      setFilters({ categoryIds: value.length > 0 ? value : null })
  };
}
