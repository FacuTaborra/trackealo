'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getTransactions } from '@/features/transactions/data/get-transactions';
import { formatCurrency, formatDate } from '@/lib/format';
import type { DashboardFilters } from '@/features/overview/data/dashboard-filters';

interface DashboardTransactionsPanelProps {
  filters: DashboardFilters;
}

export function DashboardTransactionsPanel({
  filters
}: DashboardTransactionsPanelProps) {
  const { data = [], isLoading } = useQuery({
    queryKey: [
      'dashboard-transactions',
      filters.currency,
      filters.fromDate.toISOString(),
      filters.toDate.toISOString(),
      filters.accountId,
      filters.categoryIds
    ],
    queryFn: () =>
      getTransactions({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        accountId: filters.accountId,
        categoryIds: filters.categoryIds,
        currency: filters.currency
      })
  });

  return (
    <Card className='flex h-full flex-col overflow-hidden'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>Transacciones</CardTitle>
        <CardDescription>Filtradas por el período seleccionado</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col overflow-hidden p-0'>
        {isLoading ? (
          <div className='space-y-3 p-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className='text-muted-foreground py-8 text-center text-sm'>
            No hay transacciones en este período.
          </p>
        ) : (
          <ul className='flex-1 divide-y overflow-y-auto'>
            {data.slice(0, 50).map((tx) => {
              const isOutgoing =
                tx.type === 'expense' ||
                (tx.type === 'transfer' && tx.to_account_id != null);
              const isPositive = !isOutgoing;
              return (
                <li key={tx.id}>
                  <Link
                    href={`/dashboard/transactions/${tx.id}`}
                    className='hover:bg-muted/50 flex items-center gap-3 px-4 py-3 transition-colors'
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                        isPositive
                          ? 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400'
                          : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className='size-4' />
                      ) : (
                        <ArrowDownLeft className='size-4' />
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {tx.description}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        {tx.category?.name ?? 'Sin categoría'} ·{' '}
                        {formatDate(tx.date)}
                      </p>
                    </div>
                    <div className='flex flex-col items-end gap-0.5'>
                      <span
                        className={`text-sm font-semibold ${
                          isPositive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isPositive ? '+' : '-'}
                        {formatCurrency(
                          tx.amount,
                          tx.account?.currency ?? filters.currency
                        )}
                      </span>
                      {tx.account?.name && (
                        <span className='text-muted-foreground text-[10px]'>
                          {tx.account.name}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {data.length > 50 && (
          <div className='border-t p-2'>
            <Button variant='ghost' size='sm' className='w-full' asChild>
              <Link href='/dashboard/transactions'>
                Ver todas ({data.length})
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
