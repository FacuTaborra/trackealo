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
import { Pie, PieChart, Cell } from 'recharts';
import { getCategoryBreakdown } from '@/features/overview/data/get-category-breakdown';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

const chartConfig = {
  value: {
    label: 'Monto',
    color: 'hsl(var(--chart-1))'
  }
} satisfies ChartConfig;

export default function CategoryBreakdownSlot() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['overview', 'category-breakdown'],
    queryFn: () => getCategoryBreakdown(5)
  });

  if (isLoading) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle>Gastos por categoría</CardTitle>
          <CardDescription>Top 5 del mes actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-[200px] animate-pulse rounded-full bg-muted' />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Gastos por categoría</CardTitle>
        <CardDescription>Top 5 del mes actual</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className='flex h-[200px] items-center justify-center'>
            <p className='text-muted-foreground text-center text-sm'>
              No hay gastos categorizados este mes.
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
            <ChartContainer config={chartConfig} className='h-[180px] w-full md:w-1/2'>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={data}
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  outerRadius={90}
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className='flex flex-col gap-2 md:w-1/2'>
              {data.map((item, index) => (
                <li key={item.name} className='flex items-center gap-2 text-sm'>
                  <span
                    className='size-3 shrink-0 rounded-full'
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className='text-muted-foreground flex-1 truncate'>{item.name}</span>
                  <span className='font-medium tabular-nums'>
                    {((item.value / data.reduce((s, d) => s + d.value, 0)) * 100).toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
