'use server';

import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import {
  accountsTable,
  categoriesTable,
  transactionsTable
} from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';

const recentTransactionSchema = z.object({
  id: z.number(),
  description: z.string(),
  amount: z.number(),
  type: z.string(),
  date: z.coerce.date(),
  to_account_id: z.number().nullable(),
  account: z.object({ name: z.string(), currency: z.string() }).nullable(),
  category: z.object({ name: z.string() }).nullable()
});

export async function getRecentTransactions(limit = 5) {
  const { session } = await getAuthContext();

  const rows = await db
    .select({
      id: transactionsTable.id,
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      type: transactionsTable.type,
      date: transactionsTable.date,
      to_account_id: transactionsTable.to_account_id,
      account: {
        name: accountsTable.name,
        currency: accountsTable.currency
      },
      category: {
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
    .where(eq(transactionsTable.user_id, session.user.id))
    .orderBy(sql`${transactionsTable.date} DESC`)
    .limit(limit);

  return z.array(recentTransactionSchema).parse(rows);
}
