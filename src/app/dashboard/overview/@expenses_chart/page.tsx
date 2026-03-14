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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { getMonthlyStats } from '@/features/overview/data/get-monthly-stats';

const chartConfig = {
  income: {
    label: 'Ingresos',
    color: 'hsl(var(--chart-1))'
  },
  expense: {
    label: 'Egresos',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;

export default function ExpensesChartSlot() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['overview', 'monthly-stats'],
    queryFn: () => getMonthlyStats(6)
  });

  if (isLoading) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle>Ingresos vs Egresos</CardTitle>
          <CardDescription>Últimos 6 meses</CardDescription>
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
        <CardTitle>Ingresos vs Egresos</CardTitle>
        <CardDescription>Últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.income === 0 && d.expense === 0) ? (
          <p className='text-muted-foreground py-8 text-center text-sm'>
            No hay datos para mostrar.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className='h-[200px] w-full'>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey='income'
                fill='var(--color-income)'
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey='expense'
                fill='var(--color-expense)'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
