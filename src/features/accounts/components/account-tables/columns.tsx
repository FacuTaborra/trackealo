'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';
import type { Account } from '../../data/get-accounts-schema';

import { CellAction } from './cell-action';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'Cuenta corriente',
  savings: 'Ahorro',
  credit: 'Tarjeta de crédito',
  cash: 'Efectivo'
};

export function getColumns(): ColumnDef<Account>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nombre' />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>{row.getValue('name')}</span>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tipo' />
      ),
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return (
          <Badge variant='outline'>
            {ACCOUNT_TYPE_LABELS[type] ?? type}
          </Badge>
        );
      },
      enableSorting: true
    },
    {
      accessorKey: 'balance',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Saldo' />
      ),
      cell: ({ row }) => (
        <span className='tabular-nums'>
          {formatCurrency(row.getValue('balance'), row.original.currency)}
        </span>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'currency',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Moneda' />
      ),
      cell: ({ row }) => row.getValue('currency'),
      enableSorting: true
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction row={row} />
    }
  ];
}
