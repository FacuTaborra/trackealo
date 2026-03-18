'use client';

import { useQuery } from '@tanstack/react-query';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardFiltersBar } from '@/features/overview/components/dashboard-filters-bar';
import { DashboardTransactionsPanel } from '@/features/overview/components/dashboard-transactions-panel';
import { CurrencyPanel } from '@/features/overview/components/currency-panel';
import { getUserCurrencies } from '@/features/overview/data/get-dashboard-stats';
import { useDashboardFilters } from '@/hooks/use-dashboard-filters';

const CURRENCY_LABELS: Record<string, string> = {
  ARS: 'Pesos argentinos',
  USD: 'Dólares estadounidenses',
  EUR: 'Euros'
};

export default function OverviewPage() {
  const {
    fromDate,
    toDate,
    categoryIds,
    accountId,
    currency,
    setCurrency,
    setCategoryIds
  } = useDashboardFilters();

  const { data: currencies = ['ARS'] } = useQuery({
    queryKey: ['user-currencies'],
    queryFn: () => getUserCurrencies()
  });

  const activeCurrency = currencies.includes(currency)
    ? currency
    : (currencies[0] ?? 'ARS');

  const renderTwoColumnLayout = (currency: string) => {
    const label = CURRENCY_LABELS[currency] ?? currency;
    const filters = {
      currency,
      fromDate,
      toDate,
      categoryIds,
      accountId
    };
    return (
      <>
        <div className='flex w-full items-center gap-3'>
          <h2 className='text-lg font-semibold'>{label}</h2>
          <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium'>
            {currency}
          </span>
          <div className='bg-border h-px flex-1' />
        </div>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-stretch'>
          <div className='min-w-0 flex-1'>
            <CurrencyPanel
              currency={currency}
              label={label}
              fromDate={fromDate}
              toDate={toDate}
              categoryIds={categoryIds}
              accountId={accountId}
              onCategoryClick={(id) => setCategoryIds([id])}
              hideHeader
            />
          </div>
          <div className='w-full shrink-0 lg:max-h-[calc(100dvh-200px)] lg:w-80 lg:overflow-hidden xl:w-96'>
            <DashboardTransactionsPanel filters={filters} />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className='flex flex-1 flex-col space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='text-2xl font-bold tracking-tight'>
          Hola, bienvenido 👋
        </h2>
        <DashboardFiltersBar />
      </div>

      {currencies.length > 1 ? (
        <Tabs
          value={activeCurrency}
          onValueChange={setCurrency}
          className='flex flex-col gap-4'
        >
          <TabsList className='w-fit'>
            {currencies.map((c) => (
              <TabsTrigger key={c} value={c}>
                {CURRENCY_LABELS[c] ?? c} ({c})
              </TabsTrigger>
            ))}
          </TabsList>
          {currencies.map((c) => (
            <TabsContent key={c} value={c} className='mt-0'>
              {renderTwoColumnLayout(c)}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        renderTwoColumnLayout(activeCurrency)
      )}
    </div>
  );
}
