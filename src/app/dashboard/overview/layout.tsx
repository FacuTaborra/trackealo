import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import React from 'react';
import { getDashboardStats } from '@/features/overview/data/get-dashboard-stats';
import { formatCurrency } from '@/lib/format';

export default async function OverViewLayout({
  recent_transactions,
  expenses_chart,
  category_breakdown,
  balance_trend
}: {
  recent_transactions: React.ReactNode;
  expenses_chart: React.ReactNode;
  category_breakdown: React.ReactNode;
  balance_trend: React.ReactNode;
}) {
  const stats = await getDashboardStats();

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hola, bienvenido 👋
          </h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Saldo total</CardDescription>
              <CardTitle className='text-xl font-semibold tabular-nums @[250px]/card:text-2xl'>
                {formatCurrency(stats.totalBalance)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  Total cuentas
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='text-muted-foreground'>
                Suma del saldo de todas tus cuentas
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Ingresos del mes</CardDescription>
              <CardTitle className='text-xl font-semibold tabular-nums text-green-600 @[250px]/card:text-2xl'>
                {formatCurrency(stats.income)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  Este mes
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='text-muted-foreground'>
                Total de ingresos del mes actual
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Egresos del mes</CardDescription>
              <CardTitle className='text-xl font-semibold tabular-nums text-red-600 @[250px]/card:text-2xl'>
                {formatCurrency(stats.expense)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingDown />
                  Este mes
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='text-muted-foreground'>
                Total de gastos del mes actual
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Ahorro neto del mes</CardDescription>
              <CardTitle
                className={`text-xl font-semibold tabular-nums @[250px]/card:text-2xl ${
                  stats.netSavings >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(stats.netSavings)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  {stats.netSavings >= 0 ? (
                    <IconTrendingUp />
                  ) : (
                    <IconTrendingDown />
                  )}
                  {stats.netSavings >= 0 ? 'Positivo' : 'Negativo'}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='text-muted-foreground'>
                Ingresos menos egresos del mes
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className='grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4 lg:col-span-4'>{expenses_chart}</div>
          <div className='col-span-4 md:col-span-3'>{recent_transactions}</div>
          <div className='col-span-4 lg:col-span-4'>{balance_trend}</div>
          <div className='col-span-4 md:col-span-3'>{category_breakdown}</div>
        </div>
      </div>
    </PageContainer>
  );
}
