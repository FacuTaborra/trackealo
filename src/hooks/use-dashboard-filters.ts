'use client';

import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsIsoDate,
  parseAsStringEnum,
  useQueryStates
} from 'nuqs';
import { useMemo } from 'react';

export type TimeRange =
  | 'this_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'custom';

const TIME_RANGE_VALUES: TimeRange[] = [
  'this_month',
  'last_3_months',
  'last_6_months',
  'this_year',
  'custom'
];

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  this_month: 'Este mes',
  last_3_months: 'Últimos 3 meses',
  last_6_months: 'Últimos 6 meses',
  this_year: 'Este año',
  custom: 'Personalizado'
};

function getDateRange(timeRange: Exclude<TimeRange, 'custom'>): {
  fromDate: Date;
  toDate: Date;
} {
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
  const [
    { timeRange, categoryIds, accountId, customFrom, customTo },
    setFilters
  ] = useQueryStates({
    timeRange:
      parseAsStringEnum<TimeRange>(TIME_RANGE_VALUES).withDefault('this_month'),
    categoryIds: parseAsArrayOf(parseAsInteger).withDefault([]),
    accountId: parseAsInteger.withDefault(0),
    customFrom: parseAsIsoDate,
    customTo: parseAsIsoDate
  });

  const { fromDate, toDate } = useMemo(() => {
    if (timeRange === 'custom') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      );
      return {
        fromDate: customFrom ?? startOfMonth,
        toDate: customTo ?? endOfMonth
      };
    }
    return getDateRange(timeRange);
  }, [timeRange, customFrom, customTo]);

  return {
    timeRange,
    categoryIds,
    accountId: accountId === 0 ? undefined : accountId,
    fromDate,
    toDate,
    customFrom:
      customFrom ??
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    customTo:
      customTo ??
      new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
        23,
        59,
        59
      ),
    setTimeRange: (value: TimeRange) => setFilters({ timeRange: value }),
    setCategoryIds: (value: number[]) =>
      setFilters({ categoryIds: value.length > 0 ? value : null }),
    setAccountId: (value: number | undefined) =>
      setFilters({ accountId: value ?? 0 }),
    setCustomRange: (from: Date, to: Date) =>
      setFilters({
        timeRange: 'custom',
        customFrom: from,
        customTo: to
      })
  };
}
