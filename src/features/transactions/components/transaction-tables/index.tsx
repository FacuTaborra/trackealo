'use client';

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';

import { DataTable } from '@/components/ui/table/data-table';

import type { Transaction } from '../../data/get-transactions-schema';
import { getColumns } from './columns';

interface TransactionTableProps {
  data: Transaction[];
  tableActions?: React.ReactNode;
}

export function TransactionTable({ data, tableActions }: TransactionTableProps) {
  const columns = getColumns();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  });

  return (
    <DataTable table={table} totalItems={data.length} tableActions={tableActions} />
  );
}
