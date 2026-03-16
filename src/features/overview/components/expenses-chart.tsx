'use client';

import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { getMonthlyStats } from '@/features/overview/data/get-monthly-stats';
import { formatCurrency } from '@/lib/format';
import type { DashboardFilters } from '@/features/overview/data/dashboard-filters';

interface ExpensesChartProps {
  filters: DashboardFilters;
}

const COLOR_INCOME = '#22c55e';
const COLOR_EXPENSE = '#ef4444';

const chartConfig = {
  income: { label: 'Ingresos', color: COLOR_INCOME },
  expense: { label: 'Egresos', color: COLOR_EXPENSE }
} satisfies ChartConfig;

function formatAxisValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
}

export function ExpensesChart({ filters }: ExpensesChartProps) {
  const { data = [], isLoading } = useQuery({
    queryKey: [
      'overview',
      'monthly-stats',
      filters.currency,
      filters.fromDate.toISOString(),
      filters.toDate.toISOString(),
      filters.categoryIds
    ],
    queryFn: () => getMonthlyStats(filters)
  });

  const isEmpty = data.every((d) => d.income === 0 && d.expense === 0);

  return (
    <Card className='flex-1'>
      <CardHeader>
        <CardTitle className='text-base'>Ingresos vs Egresos</CardTitle>
        <CardDescription>Por mes en el período seleccionado</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className='h-[240px] w-full' />
        ) : isEmpty ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>
            No hay datos para mostrar.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className='h-[240px] w-full'>
            <BarChart data={data} barCategoryGap='35%'>
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
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
                tickMargin={4}
                width={48}
                tick={{ fontSize: 11 }}
                tickFormatter={formatAxisValue}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(v) => formatCurrency(Number(v), filters.currency)}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey='income'
                fill={COLOR_INCOME}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
              <Bar
                dataKey='expense'
                fill={COLOR_EXPENSE}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
