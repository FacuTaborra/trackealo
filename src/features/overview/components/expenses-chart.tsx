'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { getPeriodStats } from '@/features/overview/data/get-period-stats';
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

function BarChartTooltip(props: {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    payload: { month: string; income: number; expense: number };
  }>;
  currency: string;
}) {
  const { active, payload, currency } = props;
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload as
    | { month: string; income: number; expense: number }
    | undefined;
  if (!row) return null;

  const { month, income, expense } = row;
  const delta = income - expense;

  return (
    <div className='bg-background rounded-lg border px-3 py-2 text-xs shadow-lg'>
      <p className='mb-2 font-semibold'>{month}</p>
      <div className='space-y-1'>
        <div className='flex justify-between gap-4'>
          <span className='text-muted-foreground'>Ingresos</span>
          <span className='font-medium text-green-600'>
            {formatCurrency(income, currency)}
          </span>
        </div>
        <div className='flex justify-between gap-4'>
          <span className='text-muted-foreground'>Egresos</span>
          <span className='font-medium text-red-600'>
            {formatCurrency(expense, currency)}
          </span>
        </div>
        <div className='flex justify-between gap-4 border-t pt-1'>
          <span className='text-muted-foreground'>Delta</span>
          <span
            className={`font-semibold ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {delta >= 0 ? '+' : ''}
            {formatCurrency(delta, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

const MS_PER_DAY = 86_400_000;

export function ExpensesChart({ filters }: ExpensesChartProps) {
  const diffDays = Math.round(
    (filters.toDate.getTime() - filters.fromDate.getTime()) / MS_PER_DAY
  );
  const isDaily = diffDays <= 31;

  const { data = [], isLoading } = useQuery({
    queryKey: [
      'overview',
      'period-stats',
      filters.currency,
      filters.fromDate.toISOString(),
      filters.toDate.toISOString(),
      filters.categoryIds,
      filters.accountId
    ],
    queryFn: () => getPeriodStats(filters)
  });

  const isEmpty = data.every((d) => d.income === 0 && d.expense === 0);

  return (
    <Card className='flex-1'>
      <CardHeader>
        <CardTitle className='text-base'>Ingresos vs Egresos</CardTitle>
        <CardDescription>
          {isDaily
            ? 'Por día en el período seleccionado'
            : 'Por mes en el período seleccionado'}
        </CardDescription>
      </CardHeader>
      <CardContent className='pb-2'>
        {isLoading ? (
          <Skeleton className='min-h-[200px] w-full' />
        ) : isEmpty ? (
          <p className='text-muted-foreground py-8 text-center text-sm'>
            No hay datos para mostrar.
          </p>
        ) : isDaily ? (
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
                tick={{ fontSize: 11 }}
                interval='preserveStartEnd'
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
                content={<BarChartTooltip currency={filters.currency} />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type='monotone'
                dataKey='income'
                stroke={COLOR_INCOME}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type='monotone'
                dataKey='expense'
                stroke={COLOR_EXPENSE}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[200px] w-full'
          >
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
                content={<BarChartTooltip currency={filters.currency} />}
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
