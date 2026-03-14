'use server';

import { getAuthContext } from '@/lib/context';
import { createExcelBase64 } from '@/lib/excel';
import { formatDate } from '@/lib/format';
import { getTransactions } from '../data/get-transactions';
import type { Transaction } from '../data/get-transactions-schema';
import type { DownloadTransactionsInput } from './download-transactions-schema';

export async function downloadTransactionsAction(
  params: DownloadTransactionsInput = {}
) {
  await getAuthContext();
  const transactions = await getTransactions(params);

  const base64 = await createExcelBase64({
    sheetName: 'Transacciones',
    columns: [
      {
        id: 'date',
        header: 'Fecha',
        width: 12,
        format: (val) => (val ? formatDate(val) : '')
      },
      { id: 'description', header: 'Descripción', width: 30 },
      {
        id: 'type',
        header: 'Tipo',
        width: 12,
        format: (val) =>
          val === 'income' ? 'Ingreso' : val === 'expense' ? 'Gasto' : 'Transferencia'
      },
      {
        id: 'amount',
        header: 'Monto',
        width: 12,
        format: (val, row) =>
          row.account
            ? new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: row.account.currency
              }).format(
                row.type === 'expense' || row.type === 'transfer' ? -val : val
              )
            : String(val)
      },
      {
        id: 'account',
        header: 'Cuenta',
        width: 20,
        format: (_, row) => row.account?.name ?? ''
      },
      {
        id: 'category',
        header: 'Categoría',
        width: 20,
        format: (_, row) => row.category?.name ?? ''
      },
      { id: 'notes', header: 'Notas', width: 25 }
    ],
    data: transactions as Transaction[]
  });

  return { base64 };
}
