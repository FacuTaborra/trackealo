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
  accountId?: number;
  label: string;
  onCategoryClick?: (categoryId: number) => void;
  /** Cuando true, no renderiza el header (título + línea). Para usar con header full-width en el layout. */
  hideHeader?: boolean;
}

export function CurrencyPanel({
  currency,
  fromDate,
  toDate,
  categoryIds,
  accountId,
  label,
  onCategoryClick,
  hideHeader = false
}: CurrencyPanelProps) {
  const filters: DashboardFilters = {
    currency,
    fromDate,
    toDate,
    categoryIds,
    accountId
  };

  return (
    <section className='space-y-4'>
      {!hideHeader && (
        <div className='flex items-center gap-3'>
          <h2 className='text-lg font-semibold'>{label}</h2>
          <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium'>
            {currency}
          </span>
          <div className='bg-border h-px flex-1' />
        </div>
      )}

      <StatsCards filters={filters} />

      <div className='flex flex-col gap-4 lg:flex-row'>
        <ExpensesChart filters={filters} />
        <BalanceTrend filters={filters} />
      </div>

      <CategoryBreakdown filters={filters} onCategoryClick={onCategoryClick} />
    </section>
  );
}
