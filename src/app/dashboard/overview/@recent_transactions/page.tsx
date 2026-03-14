'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import { getRecentTransactions } from '@/features/overview/data/get-recent-transactions';

export default function RecentTransactionsSlot() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['overview', 'recent-transactions'],
    queryFn: () => getRecentTransactions(5)
  });

  if (isLoading) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle>Últimas transacciones</CardTitle>
          <CardDescription>Las 5 transacciones más recientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='h-12 animate-pulse rounded bg-muted' />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Últimas transacciones</CardTitle>
        <CardDescription>Las 5 transacciones más recientes</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className='text-muted-foreground text-sm'>
            No hay transacciones aún.
          </p>
        ) : (
          <div className='space-y-3'>
            {transactions.map((tx) => {
              const amount =
                tx.type === 'expense' || tx.type === 'transfer'
                  ? -tx.amount
                  : tx.amount;
              const currency = tx.account?.currency ?? 'ARS';
              return (
                <div
                  key={tx.id}
                  className='flex items-center justify-between border-b pb-2 last:border-0'
                >
                  <div>
                    <p className='font-medium'>{tx.description}</p>
                    <p className='text-muted-foreground text-xs'>
                      {formatDate(tx.date)} · {tx.account?.name ?? '-'}
                    </p>
                  </div>
                  <span
                    className={
                      amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {formatCurrency(amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <Link
          href='/dashboard/transactions'
          className='text-primary mt-4 block text-sm font-medium hover:underline'
        >
          Ver todas las transacciones →
        </Link>
      </CardContent>
    </Card>
  );
}
