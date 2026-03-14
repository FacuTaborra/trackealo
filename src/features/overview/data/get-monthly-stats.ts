'use server';

import { and, eq, gte, lte, sql } from 'drizzle-orm';

import { transactionsTable } from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';

export async function getMonthlyStats(months = 6) {
  const { session } = await getAuthContext();
  const userId = session.user.id;

  const now = new Date();
  const result: { month: string; income: number; expense: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const [incomeRow, expenseRow] = await Promise.all([
      db
        .select({
          total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
        })
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.user_id, userId),
            eq(transactionsTable.type, 'income'),
            gte(transactionsTable.date, start),
            lte(transactionsTable.date, end)
          )
        ),
      db
        .select({
          total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
        })
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.user_id, userId),
            eq(transactionsTable.type, 'expense'),
            gte(transactionsTable.date, start),
            lte(transactionsTable.date, end)
          )
        )
    ]);

    result.push({
      month: start.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
      income: Number(incomeRow[0]?.total ?? 0),
      expense: Number(expenseRow[0]?.total ?? 0)
    });
  }

  return result;
}
