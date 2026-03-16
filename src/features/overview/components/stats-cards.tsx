'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingDown, TrendingUp, Wallet, PiggyBank } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardStats } from '@/features/overview/data/get-dashboard-stats';
import { formatCurrency } from '@/lib/format';
import type { DashboardFilters } from '@/features/overview/data/dashboard-filters';

interface StatsCardsProps {
  filters: DashboardFilters;
}

export function StatsCards({ filters }: StatsCardsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['overview', 'stats', filters.currency, filters.fromDate.toISOString(), filters.toDate.toISOString()],
    queryFn: () => getDashboardStats(filters)
  });

  const cards = [
    {
      title: 'Saldo total',
      value: data?.totalBalance ?? 0,
      icon: Wallet,
      color: 'text-blue-500'
    },
    {
      title: 'Ingresos',
      value: data?.income ?? 0,
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      title: 'Egresos',
      value: data?.expense ?? 0,
      icon: TrendingDown,
      color: 'text-red-500'
    },
    {
      title: 'Ahorro neto',
      value: data?.netSavings ?? 0,
      icon: PiggyBank,
      color: 'text-emerald-500'
    }
  ];

  if (isLoading) {
    return (
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='pb-2'>
              <Skeleton className='h-4 w-24' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                {card.title}
              </CardTitle>
              <Icon className={`size-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className='text-xl font-bold'>
                {formatCurrency(card.value, filters.currency)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
