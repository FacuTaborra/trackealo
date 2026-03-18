'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingDown, TrendingUp, Wallet, PiggyBank } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardStats } from '@/features/overview/data/get-dashboard-stats';
import { formatCurrency } from '@/lib/format';
import type { DashboardFilters } from '@/features/overview/data/dashboard-filters';

interface StatsCardsProps {
  filters: DashboardFilters;
}

type CardConfig = {
  title: string;
  value: number;
  icon: React.ElementType;
  accent: string;
  iconBg: string;
  pctChange: number | null;
  pctPositiveWhen: 'up' | 'down' | 'none';
};

export function StatsCards({ filters }: StatsCardsProps) {
  const { data, isLoading } = useQuery({
    queryKey: [
      'overview',
      'stats',
      filters.currency,
      filters.fromDate.toISOString(),
      filters.toDate.toISOString(),
      filters.accountId,
      filters.categoryIds
    ],
    queryFn: () => getDashboardStats(filters)
  });

  const cards: CardConfig[] = [
    {
      title: 'Saldo total',
      value: data?.totalBalance ?? 0,
      icon: Wallet,
      accent: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      pctChange: null,
      pctPositiveWhen: 'none'
    },
    {
      title: 'Ingresos',
      value: data?.income ?? 0,
      icon: TrendingUp,
      accent: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
      pctChange: data?.incomePctChange ?? null,
      pctPositiveWhen: 'up'
    },
    {
      title: 'Egresos',
      value: data?.expense ?? 0,
      icon: TrendingDown,
      accent: 'text-rose-500',
      iconBg: 'bg-rose-500/10',
      pctChange: data?.expensePctChange ?? null,
      pctPositiveWhen: 'down'
    },
    {
      title: 'Ahorro neto',
      value: data?.netSavings ?? 0,
      icon: PiggyBank,
      accent:
        (data?.netSavings ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500',
      iconBg:
        (data?.netSavings ?? 0) >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
      pctChange: data?.netSavingsPctChange ?? null,
      pctPositiveWhen: 'up'
    }
  ];

  function getDeltaDisplay(
    pct: number | null,
    positiveWhen: CardConfig['pctPositiveWhen']
  ) {
    if (pct == null || positiveWhen === 'none') return null;
    const isPositive = positiveWhen === 'up' ? pct >= 0 : pct <= 0;
    return {
      label: `${pct >= 0 ? '+' : ''}${pct}%`,
      isPositive
    };
  }

  if (isLoading) {
    return (
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className='p-6'>
            <Skeleton className='mb-4 h-9 w-9 rounded-lg' />
            <Skeleton className='mb-2 h-3 w-20' />
            <Skeleton className='h-8 w-36' />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
      {cards.map((card) => {
        const Icon = card.icon;
        const delta = getDeltaDisplay(card.pctChange, card.pctPositiveWhen);
        return (
          <Card key={card.title} className='p-6'>
            <CardContent className='p-0'>
              <div className='mb-5 flex items-start justify-between'>
                <div className={`rounded-lg p-2.5 ${card.iconBg}`}>
                  <Icon className={`size-5 ${card.accent}`} />
                </div>
                {delta && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      delta.isPositive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {delta.isPositive ? '↑' : '↓'} {delta.label}
                  </span>
                )}
              </div>
              <p className='text-muted-foreground mb-1.5 text-xs font-medium'>
                {card.title}
              </p>
              <p className={`text-2xl font-bold tracking-tight ${card.accent}`}>
                {formatCurrency(card.value, filters.currency)}
              </p>
              {delta && (
                <p className='text-muted-foreground mt-1 text-[11px]'>
                  vs período anterior
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
