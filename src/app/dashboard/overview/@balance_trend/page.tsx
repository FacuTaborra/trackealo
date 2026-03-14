'use client';

import { useQuery } from '@tanstack/react-query';
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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { getBalanceTrend } from '@/features/overview/data/get-balance-trend';
import { formatCurrency } from '@/lib/format';

const chartConfig = {
  balance: {
    label: 'Saldo',
    color: 'hsl(var(--chart-1))'
  }
} satisfies ChartConfig;

export default function BalanceTrendSlot() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['overview', 'balance-trend'],
    queryFn: () => getBalanceTrend(6)
  });

  if (isLoading) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle>Evolución del saldo</CardTitle>
          <CardDescription>Saldo acumulado últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-[200px] animate-pulse rounded bg-muted' />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Evolución del saldo</CardTitle>
        <CardDescription>Saldo acumulado últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.balance === 0) ? (
          <p className='text-muted-foreground py-8 text-center text-sm'>
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
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(v) => formatCurrency(Number(v))}
                  />
                }
              />
              <Area
                type='monotone'
                dataKey='balance'
                stroke='var(--color-balance)'
                fill='var(--color-balance)'
                fillOpacity={0.3}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
