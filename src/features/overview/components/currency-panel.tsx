'use client';

import { StatsCards } from './stats-cards';
import { ExpensesChart } from './expenses-chart';
import { BalanceTrend } from './balance-trend';
import { CategoryBreakdown } from './category-breakdown';
import type { DashboardFilters } from '@/features/overview/data/dashboard-filters';

interface CurrencyPanelProps {
  currency: string;
  fromDate: Date;
  toDate: Date;
  categoryIds?: number[];
  label: string;
}

export function CurrencyPanel({
  currency,
  fromDate,
  toDate,
  categoryIds,
  label
}: CurrencyPanelProps) {
  const filters: DashboardFilters = { currency, fromDate, toDate, categoryIds };

  return (
    <section className='space-y-4'>
      <div className='flex items-center gap-3'>
        <h2 className='text-lg font-semibold'>{label}</h2>
        <span className='rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'>
          {currency}
        </span>
        <div className='h-px flex-1 bg-border' />
      </div>

      <StatsCards filters={filters} />

      <div className='flex flex-col gap-4 lg:flex-row'>
        <ExpensesChart filters={filters} />
        <BalanceTrend filters={filters} />
      </div>

      <CategoryBreakdown filters={filters} />
    </section>
  );
}
