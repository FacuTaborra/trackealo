'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getRecentTransactions } from '@/features/overview/data/get-recent-transactions';
import { formatCurrency, formatDate } from '@/lib/format';

export function RecentTransactions() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['overview', 'recent-transactions'],
    queryFn: () => getRecentTransactions(10)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas transacciones</CardTitle>
        <CardDescription>Las 10 operaciones más recientes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>
            No hay transacciones registradas.
          </p>
        ) : (
          <ul className='divide-y'>
            {data.map((tx) => (
              <li key={tx.id} className='flex items-center gap-3 py-3'>
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                    tx.type === 'income'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowUpRight className='size-4' />
                  ) : (
                    <ArrowDownLeft className='size-4' />
                  )}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{tx.description}</p>
                  <p className='text-xs text-muted-foreground'>
                    {tx.category?.name ?? 'Sin categoría'} ·{' '}
                    {formatDate(tx.date)}
                  </p>
                </div>
                <div className='flex flex-col items-end gap-1'>
                  <span
                    className={`text-sm font-semibold ${
                      tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, tx.account?.currency ?? 'ARS')}
                  </span>
                  <div className='flex items-center gap-1'>
                    {tx.account?.currency && (
                      <Badge variant='outline' className='h-4 px-1 text-[10px]'>
                        {tx.account.currency}
                      </Badge>
                    )}
                    {tx.account?.name && (
                      <span className='text-xs text-muted-foreground'>
                        {tx.account.name}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
