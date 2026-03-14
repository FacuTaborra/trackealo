'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Transaction } from '../../data/get-transactions-schema';

import { CellAction } from './cell-action';

const TYPE_LABELS: Record<string, string> = {
  income: 'Ingreso',
  expense: 'Gasto',
  transfer: 'Transferencia'
};

export function getColumns(): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Fecha' />
      ),
      cell: ({ row }) => formatDate(row.getValue('date')),
      enableSorting: true
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Descripción' />
      ),
      cell: ({ row }) => (
        <span className='max-w-[200px] truncate'>
          {row.getValue('description')}
        </span>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Categoría' />
      ),
      cell: ({ row }) => {
        const category = row.original.category;
        return category ? (
          <Badge variant='outline'>{category.name}</Badge>
        ) : (
          <span className='text-muted-foreground'>-</span>
        );
      },
      enableSorting: false
    },
    {
      accessorKey: 'account',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Cuenta' />
      ),
      cell: ({ row }) => {
        const account = row.original.account;
        return account?.name ?? '-';
      },
      enableSorting: false
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tipo' />
      ),
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return (
          <Badge
            variant={
              type === 'income'
                ? 'default'
                : type === 'expense'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {TYPE_LABELS[type] ?? type}
          </Badge>
        );
      },
      enableSorting: true
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Monto' />
      ),
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number;
        const type = row.original.type;
        const currency = row.original.account?.currency ?? 'ARS';
        const displayAmount =
          type === 'expense' || type === 'transfer' ? -amount : amount;
        return (
          <span
            className={`tabular-nums ${
              displayAmount >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(displayAmount, currency)}
          </span>
        );
      },
      enableSorting: true
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction row={row} />
    }
  ];
}
