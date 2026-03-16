'use client';

import { useQuery } from '@tanstack/react-query';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoryBreakdown } from '@/features/overview/data/get-category-breakdown';
import { formatCurrency } from '@/lib/format';
import type { DashboardFilters } from '@/features/overview/data/dashboard-filters';

interface CategoryBreakdownProps {
  filters: DashboardFilters;
}

const FALLBACK_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

export function CategoryBreakdown({ filters }: CategoryBreakdownProps) {
  const { data = [], isLoading } = useQuery({
    queryKey: [
      'overview',
      'category-breakdown',
      filters.currency,
      filters.fromDate.toISOString(),
      filters.toDate.toISOString(),
      filters.categoryIds
    ],
    queryFn: () => getCategoryBreakdown(filters)
  });

  const isEmpty = data.length === 0 || data.every((d) => d.value === 0);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Gastos por categoría</CardTitle>
        <CardDescription>Distribución de egresos en el período</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className='h-[260px] w-full' />
        ) : isEmpty ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>
            No hay datos para mostrar.
          </p>
        ) : (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <div className='flex items-center justify-center'>
              <ResponsiveContainer width='100%' height={220}>
                <PieChart>
                  <Pie
                    data={data}
                    cx='50%'
                    cy='50%'
                    innerRadius='40%'
                    outerRadius='70%'
                    paddingAngle={3}
                    dataKey='value'
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                        stroke='transparent'
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(Number(value), filters.currency)
                    }
                    contentStyle={{
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className='flex flex-col justify-center gap-2'>
              {data.map((entry, index) => {
                const color =
                  entry.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
                const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
                return (
                  <div key={entry.name} className='flex items-center gap-3'>
                    <span
                      className='inline-block size-2.5 shrink-0 rounded-sm'
                      style={{ backgroundColor: color }}
                    />
                    <span className='min-w-0 flex-1 truncate text-sm font-medium'>
                      {entry.name}
                    </span>
                    <span className='text-xs text-muted-foreground'>{pct}%</span>
                    <span className='text-sm font-semibold tabular-nums'>
                      {formatCurrency(entry.value, filters.currency)}
                    </span>
                  </div>
                );
              })}
              <div className='mt-2 flex items-center justify-between border-t pt-2'>
                <span className='text-xs text-muted-foreground'>Total</span>
                <span className='text-sm font-bold'>
                  {formatCurrency(total, filters.currency)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
