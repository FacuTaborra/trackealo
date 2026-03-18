'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis
} from 'recharts';

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

const MS_PER_DAY = 86_400_000;
const COLOR_TREND = '#0080FF';

const chartConfig = {
  balance: { label: 'Saldo acumulado', color: COLOR_TREND }
} satisfies ChartConfig;

export function BalanceTrend({ filters }: BalanceTrendProps) {
  const diffDays = Math.round(
    (filters.toDate.getTime() - filters.fromDate.getTime()) / MS_PER_DAY
  );
  const isDaily = diffDays <= 31;

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

  const formatAxisValue = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
    return String(v);
  };

  return (
    <Card className='flex-1'>
      <CardHeader>
        <CardTitle className='text-base'>Evolución del saldo</CardTitle>
        <CardDescription>{isDaily ? 'Por día' : 'Por mes'}</CardDescription>
      </CardHeader>
      <CardContent className='pb-2'>
        {isLoading ? (
          <Skeleton className='h-[200px] w-full' />
        ) : isEmpty ? (
          <p className='text-muted-foreground py-8 text-center text-sm'>
            No hay datos para mostrar.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[200px] w-full'
          >
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: isDaily ? 11 : 12 }}
                interval={isDaily ? 'preserveStartEnd' : undefined}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                width={56}
                tick={{ fontSize: 11 }}
                tickFormatter={formatAxisValue}
              />
              <ReferenceLine
                y={0}
                stroke='hsl(var(--border))'
                strokeDasharray='4 4'
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(v) =>
                      formatCurrency(Number(v), filters.currency)
                    }
                  />
                }
              />
              <Line
                type='monotone'
                dataKey='balance'
                stroke={COLOR_TREND}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
