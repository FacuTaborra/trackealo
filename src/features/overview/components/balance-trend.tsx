'use client';

import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { getBalanceTrend } from '@/features/overview/data/get-balance-trend';
import { formatCurrency } from '@/lib/format';
import type { DashboardFilters } from '@/features/overview/data/dashboard-filters';

interface BalanceTrendProps {
  filters: DashboardFilters;
}

const chartConfig = {
  balance: { label: 'Saldo', color: 'hsl(var(--chart-3))' }
} satisfies ChartConfig;

export function BalanceTrend({ filters }: BalanceTrendProps) {
  const { data = [], isLoading } = useQuery({
    queryKey: [
      'overview',
      'balance-trend',
      filters.currency,
      filters.fromDate.toISOString(),
      filters.toDate.toISOString(),
      filters.categoryIds
    ],
    queryFn: () => getBalanceTrend(filters)
  });

  const isEmpty = data.every((d) => d.balance === 0);

  return (
    <Card className='flex-1'>
      <CardHeader>
        <CardTitle className='text-base'>Evolución del saldo</CardTitle>
        <CardDescription>Saldo acumulado en el período</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className='h-[200px] w-full' />
        ) : isEmpty ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>
            No hay datos para mostrar.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className='h-[200px] w-full'>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatCurrency(v, filters.currency)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(v) => formatCurrency(Number(v), filters.currency)}
                  />
                }
              />
              <Area
                type='monotone'
                dataKey='balance'
                stroke='var(--color-balance)'
                fill='var(--color-balance)'
                fillOpacity={0.25}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
