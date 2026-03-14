'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { IconPlus } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { getAccounts } from '../data/get-accounts';
import { AccountTable } from './account-tables';

export function AccountsListPage() {
  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts
  });

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center p-8'>
        <p className='text-muted-foreground'>Cargando cuentas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-1 items-center justify-center p-8'>
        <p className='text-destructive'>
          Error al cargar las cuentas. Intenta de nuevo.
        </p>
      </div>
    );
  }

  const newAccountButton = (
    <Button asChild size='sm'>
      <Link href='/dashboard/accounts/new'>
        <IconPlus className='mr-2 size-4' />
        Nueva cuenta
      </Link>
    </Button>
  );

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold tracking-tight'>Cuentas</h2>
        {accounts && accounts.length === 0 && (
          <div className='flex shrink-0 gap-2'>{newAccountButton}</div>
        )}
      </div>
      {accounts && accounts.length > 0 ? (
        <AccountTable data={accounts} tableActions={newAccountButton} />
      ) : (
        <div className='flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-8'>
          <p className='text-muted-foreground text-center'>
            No tienes cuentas aún. Crea una para empezar a llevar tus gastos.
          </p>
          <Button asChild className='mt-4'>
            <Link href='/dashboard/accounts/new'>
              <IconPlus className='mr-2 size-4' />
              Crear primera cuenta
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
