'use client';

import { useQuery } from '@tanstack/react-query';

import { DashboardFiltersBar } from '@/features/overview/components/dashboard-filters-bar';
import { CurrencyPanel } from '@/features/overview/components/currency-panel';
import { RecentTransactions } from '@/features/overview/components/recent-transactions';
import { getUserCurrencies } from '@/features/overview/data/get-dashboard-stats';
import { useDashboardFilters } from '@/hooks/use-dashboard-filters';

const CURRENCY_LABELS: Record<string, string> = {
  ARS: 'Pesos argentinos',
  USD: 'Dólares estadounidenses',
  EUR: 'Euros'
};

export default function OverviewPage() {
  const { fromDate, toDate, categoryIds, accountId, setCategoryIds } =
    useDashboardFilters();

  const { data: currencies = ['ARS'] } = useQuery({
    queryKey: ['user-currencies'],
    queryFn: () => getUserCurrencies()
  });

  return (
    <div className='flex flex-1 flex-col space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='text-2xl font-bold tracking-tight'>
          Hola, bienvenido 👋
        </h2>
        <DashboardFiltersBar />
      </div>

      {currencies.map((currency) => (
        <CurrencyPanel
          key={currency}
          currency={currency}
          label={CURRENCY_LABELS[currency] ?? currency}
          fromDate={fromDate}
          toDate={toDate}
          categoryIds={categoryIds}
          accountId={accountId}
          onCategoryClick={(id) => setCategoryIds([id])}
        />
      ))}

      <div className='border-t pt-6'>
        <RecentTransactions />
      </div>
    </div>
  );
}
