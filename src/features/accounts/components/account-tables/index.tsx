'use client';

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';

import { DataTable } from '@/components/ui/table/data-table';

import type { Account } from '../../data/get-accounts-schema';
import { getColumns } from './columns';

interface AccountTableProps {
  data: Account[];
  tableActions?: React.ReactNode;
}

export function AccountTable({ data, tableActions }: AccountTableProps) {
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
