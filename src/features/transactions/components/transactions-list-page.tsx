'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { IconPlus, IconDownload } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { getTransactions } from '../data/get-transactions';
import { TransactionTable } from './transaction-tables';
import { downloadTransactionsAction } from '../actions/download-transactions';
import type { GetTransactionsInput } from '../data/get-transactions-schema';

export function TransactionsListPage() {
  const [filters] = useState<GetTransactionsInput>({});

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => getTransactions(filters)
  });

  const handleDownload = async () => {
    const result = await downloadTransactionsAction(filters);
    if (result?.base64) {
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${result.base64}`;
      link.download = `transacciones-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
    }
  };

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center p-8'>
        <p className='text-muted-foreground'>Cargando transacciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-1 items-center justify-center p-8'>
        <p className='text-destructive'>
          Error al cargar las transacciones. Intenta de nuevo.
        </p>
      </div>
    );
  }

  const pageActions = (
    <>
      <Button variant='outline' onClick={handleDownload} size='sm'>
        <IconDownload className='mr-2 size-4' />
        Exportar Excel
      </Button>
      <Button asChild size='sm'>
        <Link href='/dashboard/transactions/new'>
          <IconPlus className='mr-2 size-4' />
          Nueva transacción
        </Link>
      </Button>
    </>
  );

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold tracking-tight'>Transacciones</h2>
        {transactions && transactions.length === 0 && (
          <div className='flex shrink-0 gap-2'>{pageActions}</div>
        )}
      </div>
      {transactions && transactions.length > 0 ? (
        <TransactionTable data={transactions} tableActions={pageActions} />
      ) : (
        <div className='flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-8'>
          <p className='text-muted-foreground text-center'>
            No tienes transacciones aún. Crea una para empezar a registrar tus
            gastos e ingresos.
          </p>
          <Button asChild className='mt-4'>
            <Link href='/dashboard/transactions/new'>
              <IconPlus className='mr-2 size-4' />
              Crear primera transacción
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
