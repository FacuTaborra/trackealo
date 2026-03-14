'use server';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  accountsTable,
  categoriesTable,
  transactionsTable
} from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';
import { NotFoundError } from '@/lib/errors';

import { transactionSchema } from './get-transactions-schema';

const getTransactionByIdSchema = z.object({ id: z.number() });

export async function getTransactionById(
  input: z.infer<typeof getTransactionByIdSchema>
) {
  const parsed = getTransactionByIdSchema.parse(input);
  const { session } = await getAuthContext();

  const rows = await db
    .select({
      id: transactionsTable.id,
      user_id: transactionsTable.user_id,
      account_id: transactionsTable.account_id,
      category_id: transactionsTable.category_id,
      amount: transactionsTable.amount,
      type: transactionsTable.type,
      description: transactionsTable.description,
      date: transactionsTable.date,
      notes: transactionsTable.notes,
      to_account_id: transactionsTable.to_account_id,
      created_at: transactionsTable.created_at,
      updated_at: transactionsTable.updated_at,
      account: {
        id: accountsTable.id,
        name: accountsTable.name,
        type: accountsTable.type,
        currency: accountsTable.currency
      },
      category: {
        id: categoriesTable.id,
        name: categoriesTable.name
      }
    })
    .from(transactionsTable)
    .leftJoin(
      accountsTable,
      eq(transactionsTable.account_id, accountsTable.id)
    )
    .leftJoin(
      categoriesTable,
      eq(transactionsTable.category_id, categoriesTable.id)
    )
    .where(
      and(
        eq(transactionsTable.id, parsed.id),
        eq(transactionsTable.user_id, session.user.id)
      )
    )
    .limit(1);

  if (rows.length === 0) {
    throw new NotFoundError('Transacción no encontrada');
  }

  return transactionSchema.parse(rows[0]);
}
