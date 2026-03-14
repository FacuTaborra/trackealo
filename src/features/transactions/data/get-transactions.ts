'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { transactionsTable } from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';

import {
  transactionSchema,
  type GetTransactionsInput
} from './get-transactions-schema';
import { findTransactionsByUserId } from './transactions-repo';

export async function getTransactions(params: GetTransactionsInput = {}) {
  const { session } = await getAuthContext();

  if (params.ids && params.ids.length > 0) {
    const rows = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.user_id, session.user.id),
          inArray(transactionsTable.id, params.ids)
        )
      );
    return z.array(transactionSchema).parse(rows);
  }

  const rows = await findTransactionsByUserId(session.user.id, params);
  return z.array(transactionSchema).parse(rows);
}
